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
      source: "profile.md",
      schema: contentSchemas.profile,
    }),

    // The current role. Body = the bullet list of what you're doing.
    now: defineCollection({
      type: "page",
      source: "now.md",
      schema: contentSchemas.now,
    }),

    // One file per past role. Body = the summary paragraph.
    journey: defineCollection({
      type: "page",
      source: "journey/*.md",
      schema: contentSchemas.journey,
    }),

    // One file per skill group.
    skills: defineCollection({
      type: "page",
      source: "skills/*.md",
      schema: contentSchemas.skills,
    }),

    // Education panel. Body = the closing line at the end of the loop.
    contact: defineCollection({
      type: "page",
      source: "contact.md",
      schema: contentSchemas.contact,
    }),
  },
});
