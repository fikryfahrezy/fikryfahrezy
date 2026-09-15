import { defineCollection, defineContentConfig } from "@nuxt/content";
import { contentSchemas } from "./content.schema";

// Field shapes live in content.schema.ts, shared with the build-time validation
// hook in nuxt.config.ts. See content/README.md for the editing guide.

export default defineContentConfig({
  collections: {
    // Identity, links, and everything search engines / social cards read.
    // Body = the hero tagline.
    profile: defineCollection({
      type: "page",
      source: "*/profile.md",
      schema: contentSchemas.profile,
    }),

    // The current role. Body = the bullet list of what you're doing.
    now: defineCollection({
      type: "page",
      source: "*/now.md",
      schema: contentSchemas.now,
    }),

    // One file per past role. Body = the summary paragraph.
    journey: defineCollection({
      type: "page",
      source: "*/journey/*.md",
      schema: contentSchemas.journey,
    }),

    // One file per skill group.
    skills: defineCollection({
      type: "page",
      source: "*/skills/*.md",
      schema: contentSchemas.skills,
    }),

    // One file per education entry.
    education: defineCollection({
      type: "page",
      source: "*/education/*.md",
      schema: contentSchemas.education,
    }),

    // Featured projects remain independent from the GitHub repository archive
    // so private and non-repository work can be included.
    products: defineCollection({
      type: "page",
      source: "*/products/*.md",
      schema: contentSchemas.products,
    }),
  },
});
