<script setup lang="ts">
const { t } = useI18n();

useHead({
  title: () => t("projects.seoTitle"),
});

useSeoMeta({
  description: () => t("projects.description"),
  ogTitle: () => t("projects.seoTitle"),
  ogDescription: () => t("projects.description"),
});
</script>

<template>
  <div class="showcase-page section-wrap">
    <section class="showcase-hero">
      <div class="hero-index" aria-hidden="true">02</div>
      <p class="section-kicker">
        {{ t("projects.eyebrow") }} <span>/</span> {{ t("projects.status") }}
      </p>
      <h1>
        <span>{{ t("projects.titleLead") }}</span>
        <span>{{ t("projects.titleTrail") }}</span>
      </h1>
      <p class="showcase-intro">{{ t("projects.description") }}</p>
    </section>

    <section
      class="showcase-placeholder"
      :aria-label="t('projects.placeholderLabel')"
    >
      <p class="showcase-placeholder-index" aria-hidden="true">00 / 00</p>
      <div>
        <p class="meta-label">{{ t("projects.placeholderLabel") }}</p>
        <h2>{{ t("projects.comingSoon") }}</h2>
        <p>{{ t("projects.placeholderCopy") }}</p>
      </div>
      <span class="showcase-placeholder-mark" aria-hidden="true">↘</span>
    </section>
  </div>
</template>
