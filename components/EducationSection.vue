<script setup lang="ts">
const { data: education } = await useEducation();
const { t } = useI18n();
</script>

<template>
  <section id="education" class="education-section section-wrap section-block">
    <SectionHeading
      index="05"
      :kicker="t('sections.education.eyebrow')"
      :title="t('sections.education.label')"
      glyph="基礎"
    />

    <div class="education-list">
      <article
        v-for="(entry, i) in education"
        :key="entry.id"
        v-reveal="i * 80"
        v-tilt="{ max: 4 }"
        class="education-card"
      >
        <div class="education-stub" aria-hidden="true">
          <span>EDU</span>
          <strong>{{ (i + 1).toString().padStart(2, "0") }}</strong>
        </div>
        <div class="education-body">
          <p class="meta-label">{{ entry.period }}</p>
          <h3>{{ entry.degree }}</h3>
          <p>{{ entry.school }}</p>
        </div>
      </article>
    </div>
  </section>
</template>
