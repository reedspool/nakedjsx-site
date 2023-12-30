import type { createClient as supabaseCreateClient } from "@supabase/supabase-js";
import { createBrowserClient } from "@supabase/ssr";
import { Database } from "../server/src/supabaseGeneratedTypes";

// What to do once authenticated cookies are established
const next = () =>
  (location.pathname = "/record/cpnt-body-weight-history.html");

const supabaseClient = createBrowserClient<Database>(
  "https://yhuswwhmfuptgznlkdvv.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlodXN3d2htZnVwdGd6bmxrZHZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTkwNzgyNjksImV4cCI6MjAxNDY1NDI2OX0.vF_fbpeSORP5ve5wVVty4lm5HaOAwGSgQxq4s39udpM",
  {
    global: {
      fetch: (url, options) =>
        fetch(url, {
          ...options,
          credentials: url
            .toString()
            .match(/^https:\/\/reeds-website-server.fly.dev/)
            ? "include"
            : undefined,
        }),
    },
    // Empty object here makes supabase use `document.cookies`
    cookies: {},
    cookieOptions: {},
  },
);

window.supabaseClient = supabaseClient;
window.receiveGoogleLoginCredentialResponse = async function (response) {
  const { data, error } = await supabaseClient.auth.signInWithIdToken({
    provider: "google",
    token: response.credential,
    nonce: "NONCE", // must be the same one as provided in data-nonce (if any)
  });

  if (error) {
    throw error;
  }

  console.log("Supabase auth complete", { data, error });

  next();
};

declare global {
  interface Window {
    // Manually typing the response from Google
    receiveGoogleLoginCredentialResponse: (response: {
      credential: string;
    }) => Promise<void>;
    supabase: { createClient: typeof supabaseCreateClient };
    supabaseClient: ReturnType<typeof createBrowserClient<Database>>;
  }
}

window.addEventListener("load", async () => {
  const { data, error } = await supabaseClient.auth.getUser();
  if (!error && data) {
    console.log("Instant reauthentication succeeded", { data, error });
    next();
  } else {
    console.log("Instant reauthentication failed", { data, error });
  }
});
