# Editing the site content

Everything the site says lives in this folder. Content is organized by locale:
`content/en/` for English and `content/id/` for Bahasa Indonesia. Keep a
matching file in both folders when adding or changing an entry.

If a localized file is absent, the site uses its English equivalent. This lets
you translate incrementally; remove a locale file only when its English content
is suitable for that audience.

## Interface translations

The interface has English and Bahasa Indonesia versions. Shared interface copy
(navigation, buttons, and section labels) lives in `i18n/locales/en.json` and
`i18n/locales/id.json`. English is available at `/`; Bahasa
Indonesia is available at `/id`. Keep the same keys in both files when adding
or changing interface text.

Each portfolio entry has an English and Indonesian version. Company and
technology names can remain unchanged while roles, locations, dates, and prose
are translated.

## Where things are

| File                | What it controls                                        |
| ------------------- | ------------------------------------------------------- |
| `en/profile.md`, `id/profile.md` | Name, role, location, email, links, and SEO copy |
| `../i18n/locales/*.json` | Nav labels and the small uppercase line above a section |
| `en/now.md`, `id/now.md` | The current-role panel and its bullets |
| `en/journey/*.md`, `id/journey/*.md` | One file per past role on the timeline |
| `en/skills/*.md`, `id/skills/*.md` | One file per skill-group card |
| `en/contact.md`, `id/contact.md` | Education panel and closing line |

## How a file is built

Every file has two parts:

```md
---
locale: en              ← must match the enclosing folder (`en` or `id`)
company: eFishery          ← the fields, between the two --- lines
period: Jul 2022 — Feb 2025
tags:
  - React                  ← a list: one item per line, starting with "- "
  - TypeScript
---

The paragraph below the fields is the prose shown on the card.
You can use **bold** and [links](https://example.com) here.
```

- Keep both `---` lines.
- Don't rename a field. `company:` works, `compnay:` fails the build.
- Indent with **spaces**, never tabs.
- Long text can wrap onto the next line if you indent it, like the
  `seoDescription` in `profile.md`.

## Common edits

**Add a past role.** Copy any file in both `en/journey/` and `id/journey/`,
give the copies the same filename, and translate the fields. Set `order` to
place it on the timeline — higher numbers sit further right. Gaps are fine, so
numbering by tens leaves room to slot roles in later. `clients` is optional;
delete the whole block if there isn't one.

**Reuse English content.** Do not add the locale file. The matching English
entry is displayed automatically until a localized version is created.

**Reorder the timeline or skill cards.** Change the `order` numbers. Filenames
don't affect order.

**Add a skill.** Add a `- Your Skill` line to the `items` list in the right
`skills/` file, or copy a file to make a new group. `wide: true` makes a card
span both columns.

**Change what Google and Slack show.** Edit `seoTitle`, `seoDescription`, and
`ogDescription` in the matching locale's `profile.md` file.

## If you get something wrong

The build checks every file and refuses to deploy a broken one, naming the file
and the field:

```
1 content file(s) failed validation:

content/journey/efishery.md
  • company — Required
```

So a mistake here stops the deploy — it never reaches the live site. Fix the
named field and commit again.

The field list for each file is defined in `content.schema.ts` in the project
root, if you want the exact rules.
