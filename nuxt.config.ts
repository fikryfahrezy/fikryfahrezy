import { type ContentCollectionName, contentSchemas } from "./content.schema";

// Files that failed validation during this run. Nuxt Content catches whatever
// the afterParse hook throws and downgrades it to a warning, so the throw alone
// would leave the build green. Collect the failures and fail for real below.
const invalidContent: string[] = [];

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
  devtools: { enabled: true },
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
    // The site is one page of build-time content, so bake it into HTML. This
    // also keeps @nuxt/content's SQLite out of the runtime container.
    prerender: {
      routes: ["/"],
    },
  },
  modules: [
    "@nuxt/content",
    "@nuxt/fonts",
    "@nuxt/image",
    "@nuxt/scripts",
    "@nuxt/test-utils",
    "@unocss/nuxt",
  ],
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
