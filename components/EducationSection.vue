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

    <div class="education-list">
      <article
        v-for="(entry, i) in education"
        :key="entry.id"
        class="education-card"
      >
        <p class="education-period">{{ entry.period }}</p>
        <div>
          <h3>{{ entry.degree }}</h3>
          <p>{{ entry.school }}</p>
        </div>
        <span aria-hidden="true">
          EDU/{{ (i + 1).toString().padStart(2, "0") }}
        </span>
      </article>
    </div>
  </section>
</template>
