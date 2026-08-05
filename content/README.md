# Editing the site content

Everything the site says lives in this folder. No other file needs to change to
update text. You can edit these files straight on GitHub: open the file, click
the pencil icon, make the change, and click **Commit changes**.

## Where things are

| File                | What it controls                                        |
| ------------------- | ------------------------------------------------------- |
| `profile.md`        | Name, role, location, email, links, and the SEO blurbs   |
| `sections.md`       | Nav labels and the small uppercase line above a section  |
| `now.md`            | The "Current orbit" panel — present role and its bullets |
| `journey/*.md`      | One file per past role on the timeline                   |
| `skills/*.md`       | One file per skill group card                            |
| `contact.md`        | Education panel and the closing line                     |

## How a file is built

Every file has two parts:

```md
---
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

**Add a past role.** Copy any file in `journey/`, give it a new filename, and
change the fields. Set `order` to place it on the timeline — higher numbers sit
further right. Gaps are fine, so numbering by tens leaves room to slot roles in
later. `clients` is optional; delete the whole block if there isn't one.

**Reorder the timeline or skill cards.** Change the `order` numbers. Filenames
don't affect order.

**Add a skill.** Add a `- Your Skill` line to the `items` list in the right
`skills/` file, or copy a file to make a new group. `wide: true` makes a card
span both columns.

**Change what Google and Slack show.** Edit `seoTitle`, `seoDescription`, and
`ogDescription` in `profile.md`.

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
