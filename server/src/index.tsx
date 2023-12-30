import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { Database } from "./supabaseGeneratedTypes";

import { createServerClient } from "@supabase/ssr";
import morgan from "morgan";

const app = express();
const port = process.env.PORT || 3001;

app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "https://reeds.website");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS",
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Origin, Cookie",
  );
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  return next();
});
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // Allow
      if (
        [
          "https://reeds.website",
          "https://reeds-website-server.fly.dev",
          "http://localhost:3000",
          "http://localhost:3001",
        ].includes(origin)
      ) {
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

type AuthBody = { refreshToken?: string; accessToken?: string };

const createClient = ({
  req,
  res,
}: {
  req: express.Request<{}, {}, AuthBody>;
  res: express.Response;
}) => {
  return createServerClient<Database>(
    "https://yhuswwhmfuptgznlkdvv.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlodXN3d2htZnVwdGd6bmxrZHZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTkwNzgyNjksImV4cCI6MjAxNDY1NDI2OX0.vF_fbpeSORP5ve5wVVty4lm5HaOAwGSgQxq4s39udpM",
    {
      cookies: {
        get: (key) => {
          const cookies = req.cookies;
          const cookie = cookies[key] ?? "";
          return decodeURIComponent(cookie);
        },
        set: (key, value, options) => {
          if (!res) return;
          res.cookie(key, encodeURIComponent(value), {
            ...options,
            sameSite: "Lax",
            httpOnly: true,
          });
        },
        remove: (key, options) => {
          if (!res) return;
          res.cookie(key, "", { ...options, httpOnly: true });
        },
      },
    },
  );
};
const giveMeAnAuthenticatedSupabaseClient = async (
  req: express.Request<{}, {}, AuthBody>,
  res: express.Response,
) => {
  const startTime = process.hrtime();
  {
    const [seconds, nanos] = process.hrtime(startTime);
    const durationInMillis = (seconds * 1000000000 + nanos) / 1000000; // convert first to ns then to ms
    console.log(`Start: ${durationInMillis}`);
  }

  const supabase = createClient({ req, res });

  {
    const [seconds, nanos] = process.hrtime(startTime);
    const durationInMillis = (seconds * 1000000000 + nanos) / 1000000; // convert first to ns then to ms
    console.log(`Before set session: ${durationInMillis}`);
  }

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

app.post(
  "/",
  async (
    req: express.Request<{}, {}, AuthBody>,
    res: express.Response,
    next,
  ) => {
    let supabase;
    try {
      supabase = await giveMeAnAuthenticatedSupabaseClient(req, res);
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
  },
);

app.get(
  "/record/cpnt-body-weight-history.html",
  async (
    req: express.Request<{}, {}, AuthBody>,
    res: express.Response,
    next,
  ) => {
    let supabase;
    try {
      supabase = await giveMeAnAuthenticatedSupabaseClient(req, res);
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

app.use(express.static("static-site"));

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
