import { type ContentCollectionName, contentSchemas } from "./content.schema";

// Files that failed validation during this run. Nuxt Content catches whatever
// the afterParse hook throws and downgrades it to a warning, so the throw alone
// would leave the build green. Collect the failures and fail for real below.
const invalidContent: string[] = [];

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
  devtools: { enabled: true },
  runtimeConfig: {
    // Set NUXT_GITHUB_TOKEN in production for a higher GitHub API rate limit.
    githubToken: "",
    githubUsername: "",
    // Create an API client at myanimelist.net/apiconfig to populate /anime.
    malClientId: "",
    malUsername: "",
    // Register an application at last.fm/api/account/create to populate /music.
    lastfmApiKey: "",
    lastfmUsername: "",
  },
  hooks: {
    // Nuxt Content drops unrecognised frontmatter keys without complaining, so
    // a typo like `compnay:` would otherwise ship a card with a blank company
    // name. Re-check every parsed file against content.schema.ts.
    "content:file:afterParse"(ctx) {
      const schema =
        contentSchemas[ctx.collection.name as ContentCollectionName];
      if (!schema) return;

      const result = schema.safeParse(ctx.content);
      if (result.success) return;

      const problems = result.error.issues.map((issue) => {
        const field = issue.path.join(".") || "(root)";
        return `  • ${field} — ${issue.message}`;
      });
      // ctx.file.id is prefixed with the collection name ("journey/journey/x.md"
      // ), so strip it to get the path an editor actually sees on GitHub.
      const name = ctx.collection.name;
      const path = ctx.file.id.startsWith(`${name}/`)
        ? ctx.file.id.slice(name.length + 1)
        : ctx.file.id;
      const report = `content/${path}\n${problems.join("\n")}`;
      if (!invalidContent.includes(report)) invalidContent.push(report);

      // Throwing makes Content skip the file, so a broken entry disappears in
      // dev rather than rendering as a blank card.
      throw new Error(`Invalid content in ${report}`);
    },

    // The actual gate: stop the build before anything is emitted.
    "build:before"() {
      if (invalidContent.length === 0) return;
      throw new Error(
        `\n${invalidContent.length} content file(s) failed validation:\n\n` +
          `${invalidContent.join("\n\n")}\n\n` +
          "Check the field names against content/README.md.\n",
      );
    },
  },
  nitro: {
    preset: "bun",
    // Dynamic showcase routes use runtime SSR so their external data stays
    // fresh. Only the content-backed landing pages are generated at build time.
    prerender: {
      routes: ["/", "/id"],
    },
  },
  modules: [
    "@nuxt/content",
    "@nuxt/fonts",
    "@nuxt/image",
    "@nuxtjs/i18n",
    "@nuxt/scripts",
    "@nuxt/test-utils",
    "@unocss/nuxt",
  ],
  i18n: {
    // Keep English at the canonical root URL while making translated pages
    // shareable at a stable, locale-prefixed URL (for example, `/id`).
    strategy: "prefix_except_default",
    defaultLocale: "en",
    langDir: "locales",
    locales: [
      { code: "en", language: "en-US", file: "en.json", name: "English" },
      {
        code: "id",
        language: "id-ID",
        file: "id.json",
        name: "Bahasa Indonesia",
      },
    ],
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: "portfolio_locale",
      redirectOn: "root",
    },
  },
  content: {
    // Content needs SQLite to index content/ at build time. Left to its own
    // detection it installs the native `better-sqlite3` package; "native"
    // instead uses `node:sqlite` when the build runs under Node, and falls
    // through to `bun:sqlite` when it runs under Bun (as it does in Docker).
    // Either way, no native module and nothing extra in package.json.
    experimental: { sqliteConnector: "native" },
  },
  css: ["@unocss/reset/tailwind.css", "~/assets/css/main.css"],
  fonts: {
    families: [
      { name: "Space Grotesk", provider: "google", weights: [500, 600, 700] },
      { name: "Outfit", provider: "google", weights: [300, 400, 500, 600] },
    ],
  },
});
