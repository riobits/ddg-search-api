import { Elysia, t } from "elysia";
import search from "./lib/search";

if (!Bun.env.WEBSHARE_ROTATING_PROXY) {
  throw new Error(
    "WEBSHARE_ROTATING_PROXY environment variable is not set. Please set it to your Webshare rotating proxy URL.",
  );
}

const app = new Elysia()
  .group("/api/v1", (app) => {
    app.get(
      "/search",
      async ({ query }) => {
        const results = await search(query);
        return { success: true, results };
      },
      {
        query: t.Object({
          q: t.String(),
          kl: t.Optional(t.String()),
          kp: t.Numeric({
            error: "kp must be 0, -1, or -2",
            enum: [0, -1, -2],
          }),
        }),
      },
    );
    return app;
  })
  .listen(3000);

console.log(`🪿 Search service is running on ${app.server?.protocol}://${app.server?.hostname}:${app.server?.port}`);
