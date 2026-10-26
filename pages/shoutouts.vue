<script setup lang="ts">
import { useShoutouts } from "~/composables/useResume";

const { t } = useI18n();

const { data: shoutouts } = await useShoutouts();

useHead({
  title: () => t("shoutouts.seoTitle"),
});

useSeoMeta({
  description: () => t("shoutouts.description"),
  ogTitle: () => t("shoutouts.seoTitle"),
  ogDescription: () => t("shoutouts.description"),
});
</script>

<template>
  <div class="showcase-page section-wrap">
    <PageHeader
      index="05"
      :kicker="t('shoutouts.eyebrow')"
      :title="t('shoutouts.title')"
      glyph="尊敬"
    >
      <p>{{ t("shoutouts.description") }}</p>
      <p>{{ t("shoutouts.count", shoutouts.length) }}</p>
    </PageHeader>

    <section
      v-if="shoutouts.length === 0"
      class="showcase-placeholder"
      :aria-label="t('shoutouts.emptyLabel')"
    >
      <p class="showcase-placeholder-index" aria-hidden="true">00 / 00</p>
      <div>
        <p class="meta-label">{{ t("shoutouts.emptyLabel") }}</p>
        <h2>{{ t("shoutouts.emptyTitle") }}</h2>
      </div>
      <span class="showcase-placeholder-mark" aria-hidden="true">↘</span>
    </section>

    <ol v-else class="shoutout-list" role="list">
      <li
        v-for="(person, personIndex) in shoutouts"
        :key="person.slug"
        v-reveal="personIndex * 80"
        class="shoutout-entry"
      >
        <aside class="shoutout-aside" aria-hidden="true">
          <span class="shoutout-number">
            {{ String(personIndex + 1).padStart(2, "0") }}
          </span>
          <span v-if="person.nativeName" class="shoutout-native">
            {{ person.nativeName }}
          </span>
        </aside>

        <div class="shoutout-main">
          <p class="meta-label">{{ person.role }}</p>
          <h2 class="shoutout-name">
            <a
              v-if="person.url"
              :href="person.url"
              target="_blank"
              rel="noreferrer"
            >
              {{ person.name }}
            </a>
            <template v-else>{{ person.name }}</template>
          </h2>
          <ContentRenderer :value="person" class="shoutout-note" />


          <p
            v-if="person.url || person.links?.length"
            class="shoutout-links"
          >
            <a
              v-if="person.url"
              :href="person.url"
              target="_blank"
              rel="noreferrer"
            >
              {{ t("shoutouts.website") }} <span aria-hidden="true">↗</span>
            </a>
            <a
              v-for="link in person.links"
              :key="link.url"
              :href="link.url"
              target="_blank"
              rel="noreferrer"
            >
              {{ link.label }} <span aria-hidden="true">↗</span>
            </a>
          </p>
        </div>
      </li>
    </ol>
  </div>
</template>

<style scoped>
.shoutout-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.shoutout-entry {
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr);
  gap: clamp(20px, 3vw, 40px);
  padding-block: clamp(32px, 4vw, 56px);
  border-bottom: 1px solid var(--line-strong);
}

/* The page header already draws the rule above the first entry. */
.shoutout-entry:first-child {
  padding-top: 0;
}

.shoutout-aside {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
}

.shoutout-number {
  color: transparent;
  font-family: var(--display);
  font-size: 40px;
  font-weight: 800;
  letter-spacing: -0.05em;
  line-height: 1;
  -webkit-text-stroke: 1px var(--line-strong);
}

.shoutout-native {
  color: var(--accent);
  font-family: var(--jp);
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 0.2em;
  writing-mode: vertical-rl;
}

.shoutout-main {
  display: grid;
  gap: 20px;
  min-width: 0;
}

.shoutout-name {
  margin-top: -12px;
  font-family: var(--display);
  font-size: clamp(34px, 4.6vw, 64px);
  font-weight: 800;
  letter-spacing: -0.045em;
  line-height: 0.95;
}

.shoutout-name a {
  transition: color 300ms ease;
}

.shoutout-name a:hover {
  color: var(--accent);
}

.shoutout-note {
  display: grid;
  gap: 14px;
  max-width: 62ch;
  padding-left: 18px;
  border-left: 2px solid var(--comet);
  font-size: 16px;
  line-height: 1.7;
}

.shoutout-note > :deep(*) {
  margin: 0;
}

.shoutout-note :deep(a) {
  border-bottom: 1px solid var(--accent);
  transition: color 200ms ease;
}

.shoutout-note :deep(a:hover) {
  color: var(--accent);
}

.shoutout-note :deep(strong) {
  font-weight: 600;
}

.shoutout-note :deep(ul),
.shoutout-note :deep(ol) {
  display: grid;
  gap: 6px;
  padding: 0;
  list-style: none;
}

.shoutout-note :deep(ol) {
  counter-reset: shoutout-note;
}

.shoutout-note :deep(li) {
  position: relative;
  padding-left: 26px;
}

.shoutout-note :deep(ul > li)::before {
  position: absolute;
  left: 0;
  color: var(--comet);
  content: "✦";
}

.shoutout-note :deep(ol > li) {
  counter-increment: shoutout-note;
}

.shoutout-note :deep(ol > li)::before {
  position: absolute;
  left: 0;
  color: var(--muted);
  font-family: var(--mono);
  font-size: 11px;
  font-weight: 700;
  line-height: 2.5;
  content: counter(shoutout-note, decimal-leading-zero);
}

.shoutout-links {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 28px;
  font-family: var(--mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.shoutout-links a {
  padding-bottom: 4px;
  border-bottom: 1px solid var(--line-strong);
  transition:
    color 200ms ease,
    border-color 200ms ease;
}

.shoutout-links a:hover {
  border-color: var(--accent);
  color: var(--accent);
}

@media (max-width: 800px) {
  .shoutout-entry {
    grid-template-columns: 1fr;
  }

  .shoutout-aside {
    flex-direction: row;
    justify-content: space-between;
  }

  .shoutout-native {
    writing-mode: horizontal-tb;
  }
}
</style>
