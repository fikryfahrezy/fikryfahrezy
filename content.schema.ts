import { z } from "@nuxt/content";

// Shape of everything in content/. Used twice:
//   1. content.config.ts — so generated types match the files.
//   2. nuxt.config.ts — a build-time check that fails the build on a bad edit.
//
// Nuxt Content itself is lenient: a misspelled key is silently dropped and the
// page renders with a blank hole. The check in nuxt.config.ts is what turns
// that into a loud error instead.

const locale = z.enum(["en", "id"]);

export const contentSchemas = {
  profile: z.object({
    locale,
    nameLead: z.string(),
    nameTrail: z.string(),
    role: z.string(),
    location: z.string(),
    email: z.string(),
    phone: z.string(),
    website: z.string(),
    github: z.string(),
    linkedin: z.string(),
    seoTitle: z.string(),
    seoDescription: z.string(),
    ogDescription: z.string(),
  }),

  now: z.object({
    locale,
    company: z.string(),
    role: z.string(),
    period: z.string(),
    location: z.string(),
    tags: z.array(z.string()),
  }),

  journey: z.object({
    locale,
    order: z.number(),
    company: z.string(),
    role: z.string(),
    period: z.string(),
    location: z.string(),
    tags: z.array(z.string()),
    clients: z.array(z.string()).optional(),
    projects: z
      .array(
        z.object({
          company: z.string(),
          location: z.string(),
          highlights: z.array(z.string()),
        }),
      )
      .optional(),
  }),

  skills: z.object({
    locale,
    order: z.number(),
    group: z.string(),
    items: z.array(z.string()),
    wide: z.boolean().optional(),
  }),

  education: z.object({
    locale,
    school: z.string(),
    degree: z.string(),
    period: z.string(),
  }),
};

export type ContentCollectionName = keyof typeof contentSchemas;
