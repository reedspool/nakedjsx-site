import express from "express";
import cors from "cors";

const app = express();
const port = process.env.PORT || 3001;

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) {
        callback(null, true);
        // TODO I believe in production, we only want to allow requests from
        // the main site? Letting them through for local development
        /* callback(new Error("Not allowed by CORS (no origin)")); */
        return;
      }
      if (["https://reeds.website", "http://localhost:3000"].includes(origin)) {
        callback(null, true);
      } else {
        console.error(`Rejecting origin '${origin}'`);
        callback(new Error("Not allowed by CORS (bad origin)"));
        return;
      }
    },
  }),
);

app.get("/", (_, res) => {
  res.send("Welcome to Express & TypeScript Server");
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

console.log(<p>Using string implementation for JSX</p>);
