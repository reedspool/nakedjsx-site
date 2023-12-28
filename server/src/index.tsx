import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import cookieParser from "cookie-parser";
import { Database } from "./supabaseGeneratedTypes";

const supabase = createClient<Database>(
  "https://yhuswwhmfuptgznlkdvv.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlodXN3d2htZnVwdGd6bmxrZHZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTkwNzgyNjksImV4cCI6MjAxNDY1NDI2OX0.vF_fbpeSORP5ve5wVVty4lm5HaOAwGSgQxq4s39udpM",
);

const app = express();
const port = process.env.PORT || 3001;

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

app.post("/", async (req: express.Request<{}, {}, AuthBody>, res, next) => {
  const refreshToken = req.body.refreshToken;
  const accessToken = req.body.accessToken;

  if (!refreshToken || !accessToken) {
    console.error("Missing refresh token and/or access token");
    return next(new Error("User is not authenticated."));
  }

  await supabase.auth.setSession({
    refresh_token: refreshToken,
    access_token: accessToken,
  });

  const { data: user, error: authError } = await supabase.auth.getUser();

  if (authError) {
    console.error(authError);
    return next(new Error("Problem authenticating"));
  }

  const { data: records, error } = await supabase
    .from("fitness_record_weight")
    .select("*");

  if (error) {
    console.error(error);
    return next(new Error("Problem fetching data"));
  }

  res.json({ records, user });
});

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
