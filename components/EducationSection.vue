<script setup lang="ts">
const { data: education } = await useEducation();
const { t } = useI18n();
</script>

<template>
  <section id="education" class="education-section section-wrap section-block">
    <header class="section-heading">
      <p class="section-kicker">05 / {{ t("sections.education.eyebrow") }}</p>
      <h2>{{ t("sections.education.label") }}</h2>
    </header>

    <article class="education-card">
      <p class="education-period">{{ education?.period }}</p>
      <div>
        <h3>{{ education?.degree }}</h3>
        <p>{{ education?.school }}</p>
      </div>
      <span aria-hidden="true">EDU/01</span>
    </article>
  </section>
</template>
