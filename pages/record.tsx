import { Layout } from "components/Record";
export const Body = () => (
  <Layout>
    <div class="w-full h-full flex flex-col gap-4 justify-center items-center dashboard ">
      <script src="./record.js" type="module"></script>
      <script src="https://accounts.google.com/gsi/client" defer></script>

      <p>Please log in.</p>

      <div class="h-[47px] p-px">
        <div
          class="hidden"
          id="g_id_onload"
          data-client_id="903517168563-c69dsl0hhpjfcg634udkh5v1gfpgijnb.apps.googleusercontent.com"
          data-context="signin"
          data-ux_mode="popup"
          data-callback="receiveGoogleLoginCredentialResponse"
          data-nonce="8688cd9d54532fd0d160e9e8cdc9d82a1b06dedba4cf19a33836bf2d0c58f335"
          data-auto_select="true"
          data-itp_support="true"
        ></div>

        <div
          class="g_id_signin"
          data-type="standard"
          data-shape="rectangular"
          data-theme="outline"
          data-text="signin_with"
          data-size="large"
          data-logo_alignment="left"
        ></div>
      </div>

      <p>
        Or <a href="/signup">Sign up with email</a>
      </p>
    </div>
  </Layout>
);
