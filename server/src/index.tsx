import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import cookieParser from "cookie-parser";
import { Database } from "./supabaseGeneratedTypes";
import morgan from "morgan";

const app = express();
const port = process.env.PORT || 3001;

app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // Allow
      if (["https://reeds.website", "http://localhost:3000"].includes(origin)) {
        return callback(null, true); // Allow
      }

      console.error(`Rejecting origin '${origin}'`);
      callback(new Error("Not allowed by CORS (bad origin)"));
      return;
    },
  }),
);

//
// Endpoints
//

app.get("/", async (_, res) => {
  res.send("You found an API 🧐 Please be kind.");
});

type AuthBody = { refreshToken?: string; accessToken?: string };

// TODO I'm reusing these clients and setting the session - is that right? Seems likely
// that I've got a race condition where an async thing is expecting the session to still exist but it doesn't
const supabase = createClient<Database>(
  "https://yhuswwhmfuptgznlkdvv.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlodXN3d2htZnVwdGd6bmxrZHZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTkwNzgyNjksImV4cCI6MjAxNDY1NDI2OX0.vF_fbpeSORP5ve5wVVty4lm5HaOAwGSgQxq4s39udpM",
);
const giveMeAnAuthenticatedSupabaseClient = async (
  req: express.Request<{}, {}, AuthBody>,
) => {
  const startTime = process.hrtime();
  {
    const [seconds, nanos] = process.hrtime(startTime);
    const durationInMillis = (seconds * 1000000000 + nanos) / 1000000; // convert first to ns then to ms
    console.log(`Start: ${durationInMillis}`);
  }
  let refreshToken = req.query.refreshToken;
  let accessToken = req.query.accessToken;
  if (req.method === "POST") {
    refreshToken = req.body.refreshToken;
    accessToken = req.body.accessToken;
  }

  if (
    !refreshToken ||
    !accessToken ||
    typeof refreshToken !== "string" ||
    typeof accessToken !== "string"
  ) {
    console.error("Missing refresh token and/or access token", {
      accessToken,
      refreshToken,
    });
    throw new Error("User is not authenticated.");
  }

  {
    const [seconds, nanos] = process.hrtime(startTime);
    const durationInMillis = (seconds * 1000000000 + nanos) / 1000000; // convert first to ns then to ms
    console.log(`Before set session: ${durationInMillis}`);
  }
  await supabase.auth.setSession({
    refresh_token: refreshToken,
    access_token: accessToken,
  });
  {
    const [seconds, nanos] = process.hrtime(startTime);
    const durationInMillis = (seconds * 1000000000 + nanos) / 1000000; // convert first to ns then to ms
    console.log(`after set session: ${durationInMillis}`);
  }

  const { data: _, error: authError } = await supabase.auth.getUser();

  if (authError) {
    console.error(authError);
    throw new Error("Problem authenticating");
  }

  {
    const [seconds, nanos] = process.hrtime(startTime);
    const durationInMillis = (seconds * 1000000000 + nanos) / 1000000; // convert first to ns then to ms
    console.log(`returning client: ${durationInMillis}`);
  }
  return supabase;
};

app.post("/", async (req: express.Request<{}, {}, AuthBody>, res, next) => {
  let supabase;
  try {
    supabase = await giveMeAnAuthenticatedSupabaseClient(req);
  } catch (error) {
    return next(error);
  }
  const { data: user } = await supabase.auth.getUser();

  const { data: records, error } = await supabase
    .from("fitness_record_weight")
    .select("*");

  if (error) {
    console.error(error);
    return next(new Error("Problem fetching data"));
  }

  res.json({ records, user });
});

app.get(
  "/record/cpnt-body-weight-history.html",
  async (req: express.Request<{}, {}, AuthBody>, res, next) => {
    let supabase;
    try {
      supabase = await giveMeAnAuthenticatedSupabaseClient(req);
    } catch (error) {
      return next(error);
    }
    const { data: records, error } = await supabase
      .from("fitness_record_weight")
      .select("*");

    if (error) {
      console.error(error);
      return next(new Error("Problem fetching data"));
    }

    res.send(
      <table>
        <thead>
          <tr>
            <th>Time</th>
            <th>Kilograms</th>
          </tr>
        </thead>
        <tbody>
          {records.map(({ created_at, kilograms }) => {
            return (
              <tr>
                <td>{created_at}</td>
                <td>{kilograms}</td>
              </tr>
            );
          })}
        </tbody>
      </table>,
    );
  },
);

const listener = app.listen(port, () => {
  console.log(`Server is available at http://localhost:${port}`);
});

// So I can kill from local terminal with Ctrl-c
// From https://github.com/strongloop/node-foreman/issues/118#issuecomment-475902308
process.on("SIGINT", () => {
  listener.close(() => {
    process.exit(0);
  });
});
