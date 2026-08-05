import { z } from "@nuxt/content";

// Shape of everything in content/. Used twice:
//   1. content.config.ts — so generated types match the files.
//   2. nuxt.config.ts — a build-time check that fails the build on a bad edit.
//
// Nuxt Content itself is lenient: a misspelled key is silently dropped and the
// page renders with a blank hole. The check in nuxt.config.ts is what turns
// that into a loud error instead.

const sectionChrome = z.object({
  label: z.string(),
  eyebrow: z.string(),
});

export const contentSchemas = {
  profile: z.object({
    nameLead: z.string(),
    nameTrail: z.string(),
    role: z.string(),
    location: z.string(),
    email: z.string(),
    github: z.string(),
    linkedin: z.string(),
    seoTitle: z.string(),
    seoDescription: z.string(),
    ogDescription: z.string(),
  }),

  sections: z.object({
    // The hero eyebrow is built from profile.md's role + location.
    hero: z.object({ label: z.string() }),
    now: sectionChrome,
    journey: sectionChrome,
    skills: sectionChrome,
    contact: sectionChrome,
  }),

  now: z.object({
    company: z.string(),
    role: z.string(),
    period: z.string(),
    location: z.string(),
    tags: z.array(z.string()),
  }),

  journey: z.object({
    order: z.number(),
    company: z.string(),
    role: z.string(),
    period: z.string(),
    location: z.string(),
    tags: z.array(z.string()),
    clients: z.array(z.string()).optional(),
  }),

  skills: z.object({
    order: z.number(),
    group: z.string(),
    items: z.array(z.string()),
    wide: z.boolean().optional(),
  }),

  contact: z.object({
    school: z.string(),
    degree: z.string(),
    period: z.string(),
  }),
};

export type ContentCollectionName = keyof typeof contentSchemas;
