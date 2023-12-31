import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import {
  type Database,
  type FitnessRecordUserPreferencesRowSettings,
  type FitnessRecordWeightRow,
  maybeMeasurementInput,
} from "./types";
import { Components, Layout } from "components/Record";
import { CommonPage } from "components/CommonPage";

import { createServerClient } from "@supabase/ssr";
import morgan from "morgan";

const app = express();
const port = process.env.PORT || 3001;

app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
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

// Defunct, remove
type AuthBody = {};

const getUserId = async (supabase: ReturnType<typeof createClient>) => {
  const { data, error } = await supabase.auth.getSession();
  return { user_id: data.session?.user.id, error };
};

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
            sameSite: "lax",
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
  return createClient({ req, res });
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

    const Component = Components["cpnt-body-weight-history"];
    res.send(<Component records={records} />);
  },
);

app.post(
  "/entry",
  async (
    req: express.Request<
      {},
      {},
      {
        kilograms: number;
      }
    >,
    res: express.Response,
    next,
  ) => {
    let supabase;
    try {
      supabase = await giveMeAnAuthenticatedSupabaseClient(req, res);
    } catch (error) {
      return next(error);
    }

    const { data } = await supabase.auth.getUser();

    await supabase
      .from("fitness_record_weight")
      .insert([{ kilograms: req.body.kilograms, user_id: data.user!.id }]);

    res.redirect("/history");
  },
);

app.get(
  "/entry",
  async (_: express.Request<{}, {}, AuthBody>, res: express.Response) => {
    const Component = Components["cpnt-body-weight-entry"];
    res.send(
      <CommonPage>
        <Layout>
          <div class="dashboard">
            <Component />
          </div>
        </Layout>
      </CommonPage>,
    );
  },
);

app.get(
  "/entries/:id/delete",
  async (
    req: express.Request<{ id?: FitnessRecordWeightRow["id"] }, {}, {}>,
    res: express.Response,
    next,
  ) => {
    let supabase;
    try {
      supabase = await giveMeAnAuthenticatedSupabaseClient(req, res);
    } catch (error) {
      return next(error);
    }

    const { data, error: userError } = await supabase.auth.getUser();

    if (!data || userError || !data.user.id) {
      return next(userError || new Error("Auth failure"));
    }

    if (!req.params.id) {
      return next(new Error("Entry ID Required"));
    }

    const { data: records, error } = await supabase
      .from("fitness_record_weight")
      .select("*")
      .eq("user_id", data.user?.id)
      .eq("id", req.params.id)
      .limit(1);

    if (error || !records[0]) {
      console.error(error, records);
      return next(new Error("Problem fetching data"));
    }

    const Component = Components["cpnt-body-weight-entry-delete"];
    res.send(
      <CommonPage>
        <Layout>
          <div class="dashboard">
            <Component entry={records[0]} />
          </div>
        </Layout>
      </CommonPage>,
    );
  },
);

app.post(
  "/entries/:id/delete",
  async (
    req: express.Request<{ id?: FitnessRecordWeightRow["id"] }, {}, {}>,
    res: express.Response,
    next,
  ) => {
    let supabase;
    try {
      supabase = await giveMeAnAuthenticatedSupabaseClient(req, res);
    } catch (error) {
      return next(error);
    }

    const { data, error: userError } = await supabase.auth.getUser();

    if (!data || userError || !data.user.id) {
      return next(userError || new Error("Auth failure"));
    }

    if (!req.params.id) {
      return next(new Error("Entry ID Required"));
    }

    const { error } = await supabase
      .from("fitness_record_weight")
      .delete()
      .eq("user_id", data.user?.id)
      .eq("id", req.params.id);

    if (error) {
      console.error(error);
      return next(new Error("Problem fetching data"));
    }
    res.redirect("/history");
  },
);

app.get(
  "/entries/:id/edit",
  async (
    req: express.Request<{ id?: FitnessRecordWeightRow["id"] }, {}, {}>,
    res: express.Response,
    next,
  ) => {
    let supabase;
    try {
      supabase = await giveMeAnAuthenticatedSupabaseClient(req, res);
    } catch (error) {
      return next(error);
    }

    const { data, error: userError } = await supabase.auth.getUser();

    if (!data || userError || !data.user.id) {
      return next(userError || new Error("Auth failure"));
    }

    if (!req.params.id) {
      return next(new Error("Entry ID Required"));
    }

    const { data: records, error } = await supabase
      .from("fitness_record_weight")
      .select("*")
      .eq("user_id", data.user?.id)
      .eq("id", req.params.id)
      .limit(1);

    if (error || !records[0]) {
      console.error(error, records);
      return next(new Error("Problem fetching data"));
    }

    const Component = Components["cpnt-body-weight-entry-edit"];
    res.send(
      <CommonPage>
        <Layout>
          <div class="dashboard">
            <Component entry={records[0]} />
          </div>
        </Layout>
      </CommonPage>,
    );
  },
);

app.post(
  "/entries/:id/edit",
  async (
    req: express.Request<
      { id?: FitnessRecordWeightRow["id"] },
      {},
      Partial<FitnessRecordWeightRow>
    >,
    res: express.Response,
    next,
  ) => {
    let supabase;
    try {
      supabase = await giveMeAnAuthenticatedSupabaseClient(req, res);
    } catch (error) {
      return next(error);
    }

    const { data, error: userError } = await supabase.auth.getUser();

    if (!data || userError || !data.user.id) {
      return next(userError || new Error("Auth failure"));
    }

    if (!req.params.id) {
      return next(new Error("Entry ID Required"));
    }

    const update: Partial<FitnessRecordWeightRow> = {};

    if (req.body.created_at) {
      update.created_at = req.body.created_at;
    }
    if (req.body.kilograms) {
      update.kilograms = req.body.kilograms;
    }
    const { error } = await supabase
      .from("fitness_record_weight")
      .update(update)
      .eq("user_id", data.user?.id)
      .eq("id", req.params.id);

    if (error) {
      console.error(error);
      return next(new Error("Problem updating data"));
    }

    res.redirect(303, `/entries/${req.params.id}/edit`);
  },
);

app.get(
  "/history",
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
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return next(new Error("Problem fetching data"));
    }

    const Component = Components["cpnt-body-weight-history"];
    res.send(
      <CommonPage>
        <Layout>
          <div class="dashboard">
            <Component records={records} />
          </div>
        </Layout>
      </CommonPage>,
    );
  },
);

const defaultSettings: FitnessRecordUserPreferencesRowSettings = {
  version: "v1",
  timezone: "UTC",
  measurementInput: "kilograms",
};

app.get(
  "/me",
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
      .from("fitness_record_user_preferences")
      .select("*");

    if (error) {
      console.error(error);
      return next(new Error("Problem fetching data"));
    }

    let settings = defaultSettings;
    if (
      !records ||
      records.length < 1 ||
      !records[0]?.settings ||
      typeof records[0]?.settings !== "object" ||
      Array.isArray(records[0]?.settings)
    ) {
      console.log("No user settings found, using default");
    } else if (records.length > 1) {
      return next(
        new Error("Unexpected: more than one user preferences entry"),
      );
    } else {
      const { settings: coalesced, error } = coalesce(records[0]?.settings);

      if (error) {
        console.error(error);
        return next(
          new Error("Problem coalescing client-side data with defaults"),
        );
      }

      settings = coalesced;
    }

    const Component = Components["cpnt-body-weight-user-preferences"];
    res.send(
      <CommonPage>
        <Layout>
          <div class="dashboard">
            <Component settings={settings} />
          </div>
        </Layout>
      </CommonPage>,
    );
  },
);

type UserPreferencesPostBody = Partial<FitnessRecordUserPreferencesRowSettings>;

const coalesce = (
  fromDatabase: Partial<FitnessRecordUserPreferencesRowSettings>,
) => {
  const settings: FitnessRecordUserPreferencesRowSettings = {
    ...defaultSettings,
  };

  const next = (error: Error) => ({ settings: null, error });

  if (Array.isArray(fromDatabase))
    return next(new Error("Settings was an array somehow"));
  if (fromDatabase.version !== "v1")
    return next(new Error("Settings version was not v1"));
  settings.version = fromDatabase.version;
  if (typeof fromDatabase.timezone !== "string")
    return next(new Error("Timezone was invalid"));
  settings.timezone = fromDatabase.timezone;
  if (typeof fromDatabase.measurementInput !== "string")
    return next(new Error("Measurement Input was invalid"));
  const measurementInput = maybeMeasurementInput(fromDatabase.measurementInput);
  if (!measurementInput)
    return next(new Error("Measurement Input was an invalid choice"));
  settings.measurementInput = measurementInput;
  return { settings, error: null };
};

app.post(
  "/me",
  async (
    req: express.Request<{}, {}, UserPreferencesPostBody>,
    res: express.Response,
    next,
  ) => {
    let supabase;
    try {
      supabase = await giveMeAnAuthenticatedSupabaseClient(req, res);
    } catch (error) {
      return next(error);
    }

    const { user_id, error: errorId } = await getUserId(supabase);

    if (errorId || !user_id) {
      console.error(errorId);
      return next(new Error("Problem fetching data"));
    }

    const { settings, error } = coalesce(req.body);

    if (error) {
      console.error(error);
      return next(
        new Error("Problem coalescing client-side data with defaults"),
      );
    }

    const { error: upsertError } = await supabase
      .from("fitness_record_user_preferences")
      .upsert({ user_id, settings });

    if (upsertError) {
      console.error(upsertError);
      return next(new Error("Issue inserting settings into database"));
    }

    res.redirect(303, `/me`);
  },
);

app.use(express.static("static-site"));

//
// Final 404/5XX handlers
//
app.use(function (
  err: { status?: number; message?: string } | undefined,
  req: express.Request<{}, {}, AuthBody>,
  res: express.Response,
  next: unknown,
) {
  console.error("5XX", err, req, next);
  res.status(err?.status || 500);

  const Component = Components["cpnt-body-weight-5XX"];
  res.send(
    <CommonPage>
      <Layout>
        <div class="dashboard">
          <Component message={err?.message} error={err} />
        </div>
      </Layout>
    </CommonPage>,
  );
});

app.use(function (
  req: express.Request<{}, {}, AuthBody>,
  res: express.Response,
) {
  res.status(404);

  const Component = Components["cpnt-body-weight-404"];
  res.send(
    <CommonPage>
      <Layout>
        <div class="dashboard">
          <Component message={`Could not find '${req.path}'`} />
        </div>
      </Layout>
    </CommonPage>,
  );
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
