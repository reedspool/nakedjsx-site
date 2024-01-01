import { CommonPage } from "components/CommonPage";
import { Components, Layout } from "components/Record";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import {
  maybeMeasurementInput,
  type Database,
  type FitnessRecordUserPreferencesRowSettings,
  type FitnessRecordWeightRow,
  maybeTimeZone,
} from "server/src/types";

import { createServerClient } from "@supabase/ssr";
import morgan from "morgan";
import { poundsToKilograms } from "src/utilities";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import localizedFormat from "dayjs/plugin/localizedFormat";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

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
  "/entry",
  async (
    req: express.Request<
      {},
      {},
      Partial<FitnessRecordWeightRow> & {
        pounds?: FitnessRecordWeightRow["kilograms"];
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

    const { user_id, error: errorId } = await getUserId(supabase);

    if (errorId || !user_id) {
      console.error(errorId);
      return next(new Error("Problem fetching data"));
    }

    let kilograms;
    if (req.body.kilograms) {
      kilograms = req.body.kilograms;
    } else if (req.body.pounds) {
      kilograms = poundsToKilograms(req.body.pounds);
    }

    if (!kilograms) {
      return next(
        new Error("Expected weight measurement, either kilograms or pounds"),
      );
    }

    await supabase.from("fitness_record_weight").insert([
      {
        user_id,
        kilograms,
      },
    ]);

    res.redirect("/history");
  },
);

app.get("/entry", async (req, res, next) => {
  let supabase;
  try {
    supabase = await giveMeAnAuthenticatedSupabaseClient(req, res);
  } catch (error) {
    return next(error);
  }

  const [{ data: settingsResults, error: errorUserPreferences }] =
    await Promise.all([
      supabase.from("fitness_record_user_preferences").select("*").limit(1),
    ]);

  if (errorUserPreferences) {
    console.error({ errorUserPreferences });
    return next(new Error("Problem fetching data"));
  }

  const { settings } = questionablySourcedSettingsToProperSafeSettings(
    settingsResults?.[0]?.settings,
  );

  const Component = Components["cpnt-body-weight-entry"];
  res.send(
    <CommonPage>
      <Layout>
        <div class="dashboard">
          <Component measurementInput={settings.measurementInput} />
        </div>
      </Layout>
    </CommonPage>,
  );
});

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

    const { user_id, error: errorId } = await getUserId(supabase);

    if (errorId || !user_id) {
      console.error(errorId);
      return next(new Error("Problem fetching data"));
    }

    if (!req.params.id) {
      return next(new Error("Entry ID Required"));
    }

    const [
      { data: records, error },
      { data: settingsResults, error: errorUserPreferences },
    ] = await Promise.all([
      supabase
        .from("fitness_record_weight")
        .select("*")
        .eq("user_id", user_id)
        .eq("id", req.params.id)
        .limit(1),
      supabase.from("fitness_record_user_preferences").select("*").limit(1),
    ]);

    if (error || errorUserPreferences || !records?.[0]) {
      console.error({ error, errorUserPreferences, records });
      return next(new Error("Problem fetching data"));
    }

    const { settings } = questionablySourcedSettingsToProperSafeSettings(
      settingsResults?.[0]?.settings,
    );

    const Component = Components["cpnt-body-weight-entry-delete"];
    res.send(
      <CommonPage>
        <Layout>
          <div class="dashboard">
            <Component
              entry={records[0]}
              measurementInput={settings.measurementInput}
              timeZone={settings.timezone}
            />
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

    const { user_id, error: errorId } = await getUserId(supabase);

    if (errorId || !user_id) {
      console.error(errorId);
      return next(new Error("Problem fetching data"));
    }

    if (!req.params.id) {
      return next(new Error("Entry ID Required"));
    }

    const { error } = await supabase
      .from("fitness_record_weight")
      .delete()
      .eq("user_id", user_id)
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

    const { user_id, error: errorId } = await getUserId(supabase);

    if (errorId || !user_id) {
      console.error(errorId);
      return next(new Error("Problem fetching data"));
    }

    if (!req.params.id) {
      return next(new Error("Entry ID Required"));
    }

    const [
      { data: records, error },
      { data: settingsResults, error: errorUserPreferences },
    ] = await Promise.all([
      supabase
        .from("fitness_record_weight")
        .select("*")
        .eq("user_id", user_id)
        .eq("id", req.params.id)
        .limit(1),

      supabase.from("fitness_record_user_preferences").select("*").limit(1),
    ]);

    if (error || errorUserPreferences || !records?.[0]) {
      console.error(error, records);
      return next(new Error("Problem fetching data"));
    }

    const { settings } = questionablySourcedSettingsToProperSafeSettings(
      settingsResults?.[0]?.settings,
    );
    const Component = Components["cpnt-body-weight-entry-edit"];
    res.send(
      <CommonPage>
        <Layout>
          <div class="dashboard">
            <Component
              entry={records[0]}
              measurementInput={settings.measurementInput}
              timeZone={settings.timezone}
            />
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
      Partial<FitnessRecordWeightRow> & {
        pounds?: FitnessRecordWeightRow["kilograms"];
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

    const { user_id, error: errorId } = await getUserId(supabase);

    if (errorId || !user_id) {
      console.error(errorId);
      return next(new Error("Problem fetching data"));
    }

    if (!req.params.id) {
      return next(new Error("Entry ID Required"));
    }

    const promises = Promise.all([
      supabase.from("fitness_record_user_preferences").select("*").limit(1),
    ]);

    const [resultsUserPreferences] = await promises;
    const { data: settingsResults, error: errorUserPreferences } =
      resultsUserPreferences;

    if (errorUserPreferences) {
      console.error({ errorUserPreferences });
      return next(new Error("Problem fetching data"));
    }

    const { settings } = questionablySourcedSettingsToProperSafeSettings(
      settingsResults?.[0]?.settings,
    );

    const update: Partial<FitnessRecordWeightRow> = {};

    if (req.body.created_at) {
      update.created_at = dayjs
        .tz(req.body.created_at, settings.timezone)
        .toISOString();
    }
    if (req.body.kilograms) {
      update.kilograms = req.body.kilograms;
    } else if (req.body.pounds) {
      update.kilograms = poundsToKilograms(req.body.pounds);
    }

    const { error } = await supabase
      .from("fitness_record_weight")
      .update(update)
      .eq("user_id", user_id)
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

    const promises = Promise.all([
      supabase
        .from("fitness_record_weight")
        .select("*")
        .order("created_at", { ascending: false }),

      supabase.from("fitness_record_user_preferences").select("*").limit(1),
    ]);

    const [resultsWeight, resultsUserPreferences] = await promises;
    const { data: records, error } = resultsWeight;
    const { data: settingsResults, error: errorUserPreferences } =
      resultsUserPreferences;

    if (error || errorUserPreferences) {
      console.error({ error });
      return next(new Error("Problem fetching data"));
    }

    const { settings } = questionablySourcedSettingsToProperSafeSettings(
      settingsResults?.[0]?.settings,
    );

    const Component = Components["cpnt-body-weight-history"];
    res.send(
      <CommonPage>
        <Layout>
          <div class="dashboard">
            <Component
              records={records}
              measurementInput={settings.measurementInput}
            />
          </div>
        </Layout>
      </CommonPage>,
    );
  },
);

const defaultSettings: FitnessRecordUserPreferencesRowSettings = {
  version: "v1",
  timezone: "America/Los_Angeles",
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

    const { settings, error: errorSettings } =
      questionablySourcedSettingsToProperSafeSettings(records[0]?.settings);

    if (errorSettings) {
      console.error(errorSettings);
      return next(
        new Error("Problem coalescing client-side data with defaults"),
      );
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

const questionablySourcedSettingsToProperSafeSettings = (
  fromDatabase: unknown,
): {
  settings: FitnessRecordUserPreferencesRowSettings;
  error: Error | null;
} => {
  const settings: FitnessRecordUserPreferencesRowSettings = {
    ...defaultSettings,
  };

  const next = (error: Error | null) => ({ settings, error });

  if (!fromDatabase) return { settings, error: null };
  if (Array.isArray(fromDatabase))
    return next(new Error("Settings was an array somehow"));
  if (typeof fromDatabase !== "object")
    return next(new Error("Settings must be an object"));
  if (!("version" in fromDatabase) || fromDatabase.version !== "v1")
    return next(new Error("Settings version was not v1"));
  settings.version = fromDatabase.version;
  if (
    !("timezone" in fromDatabase) ||
    typeof fromDatabase.timezone !== "string"
  )
    return next(new Error("Timezone was invalid"));
  if (!maybeTimeZone(fromDatabase.timezone))
    return next(new Error("Timezone was an invalid choice"));
  settings.timezone = fromDatabase.timezone;
  if (
    !("measurementInput" in fromDatabase) ||
    typeof fromDatabase.measurementInput !== "string"
  )
    return next(new Error("Measurement Input was invalid"));
  const measurementInput = maybeMeasurementInput(fromDatabase.measurementInput);
  if (!measurementInput)
    return next(new Error("Measurement Input was an invalid choice"));
  settings.measurementInput = measurementInput;
  return next(null);
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

    const { settings, error } = questionablySourcedSettingsToProperSafeSettings(
      req.body,
    );

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
