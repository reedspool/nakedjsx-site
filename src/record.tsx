import type { createClient as supabaseCreateClient } from "@supabase/supabase-js";
import { Database } from "../server/src/supabaseGeneratedTypes";

const supabaseClient = window.supabase.createClient<Database>(
  "https://yhuswwhmfuptgznlkdvv.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlodXN3d2htZnVwdGd6bmxrZHZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTkwNzgyNjksImV4cCI6MjAxNDY1NDI2OX0.vF_fbpeSORP5ve5wVVty4lm5HaOAwGSgQxq4s39udpM",
  {
    global: {
      fetch: (...args) => fetch(...args),
    },
  },
);

window.supabaseClient = supabaseClient;
window.receiveGoogleLoginCredentialResponse = async function (response) {
  const { data, error } = await supabaseClient.auth.signInWithIdToken({
    provider: "google",
    token: response.credential,
    nonce: "NONCE", // must be the same one as provided in data-nonce (if any)
  });

  console.log("Supabase auth complete", { data, error });
};

declare global {
  interface Window {
    // Manually typing the response from Google
    receiveGoogleLoginCredentialResponse: (response: {
      credential: string;
    }) => Promise<void>;
    supabase: { createClient: typeof supabaseCreateClient };
    supabaseClient: ReturnType<typeof supabaseCreateClient<Database>>;
  }
}
