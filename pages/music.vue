<script setup lang="ts">
const { t } = useI18n();

useHead({
  title: () => t("music.seoTitle"),
});

useSeoMeta({
  description: () => t("music.description"),
  ogTitle: () => t("music.seoTitle"),
  ogDescription: () => t("music.description"),
});
</script>

<template>
  <div class="showcase-page section-wrap">
    <section class="showcase-hero">
      <div class="hero-index" aria-hidden="true">04</div>
      <p class="section-kicker">
        {{ t("music.eyebrow") }} <span>/</span> {{ t("music.status") }}
      </p>
      <h1>
        <span>{{ t("music.titleLead") }}</span>
        <span>{{ t("music.titleTrail") }}</span>
      </h1>
      <p class="showcase-intro">{{ t("music.description") }}</p>
    </section>

    <section
      class="showcase-placeholder"
      :aria-label="t('music.placeholderLabel')"
    >
      <p class="showcase-placeholder-index" aria-hidden="true">00 / 00</p>
      <div>
        <p class="meta-label">{{ t("music.placeholderLabel") }}</p>
        <h2>{{ t("music.comingSoon") }}</h2>
        <p>{{ t("music.placeholderCopy") }}</p>
      </div>
      <span class="showcase-placeholder-mark" aria-hidden="true">↘</span>
    </section>
  </div>
</template>
