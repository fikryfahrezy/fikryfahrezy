<script setup lang="ts">
const { t } = useI18n();

useHead({
  title: () => t("anime.seoTitle"),
});

useSeoMeta({
  description: () => t("anime.description"),
  ogTitle: () => t("anime.seoTitle"),
  ogDescription: () => t("anime.description"),
});
</script>

<template>
  <div class="showcase-page section-wrap">
    <section class="showcase-hero">
      <div class="hero-index" aria-hidden="true">03</div>
      <p class="section-kicker">
        {{ t("anime.eyebrow") }} <span>/</span> {{ t("anime.status") }}
      </p>
      <h1>
        <span>{{ t("anime.titleLead") }}</span>
        <span>{{ t("anime.titleTrail") }}</span>
      </h1>
      <p class="showcase-intro">{{ t("anime.description") }}</p>
    </section>

    <section
      class="showcase-placeholder"
      :aria-label="t('anime.placeholderLabel')"
    >
      <p class="showcase-placeholder-index" aria-hidden="true">00 / 00</p>
      <div>
        <p class="meta-label">{{ t("anime.placeholderLabel") }}</p>
        <h2>{{ t("anime.comingSoon") }}</h2>
        <p>{{ t("anime.placeholderCopy") }}</p>
      </div>
      <span class="showcase-placeholder-mark" aria-hidden="true">↘</span>
    </section>
  </div>
</template>
