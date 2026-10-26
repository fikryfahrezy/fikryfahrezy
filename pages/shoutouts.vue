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
