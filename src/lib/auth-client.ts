import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields, jwtClient } from "better-auth/client/plugins";
import { API_URL } from "@/lib/api";

const baseURL = API_URL.replace(/\/api\/?$/, "");

export const authClient = createAuthClient({
  baseURL,
  fetchOptions: { credentials: "include" },
  plugins: [
    inferAdditionalFields<never, {
      user: { role: { type: "string"; required: false; input: true } };
    }>(),
    jwtClient(),
  ],
});
