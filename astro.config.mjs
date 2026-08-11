import { defineConfig } from "astro/config";
import netlify from "@astrojs/netlify";

// SSR ("server") mode is required, not the default static mode — the save
// API route needs to run server-side on every request so it can use the
// secret Contentful Management token safely.
export default defineConfig({
  output: "server",
  adapter: netlify(),
});
