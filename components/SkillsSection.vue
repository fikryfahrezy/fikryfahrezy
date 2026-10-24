<script setup lang="ts">
const { data: skills } = await useSkills();
const { t } = useI18n();
</script>

<template>
  <section id="skills" class="section-wrap section-block">
    <SectionHeading
      index="04"
      :kicker="t('sections.skills.eyebrow')"
      :title="t('sections.skills.label')"
      glyph="星図"
    />

    <div class="skills-grid">
      <article
        v-for="(group, i) in skills"
        :key="group.id"
        v-reveal="i * 80"
        v-tilt
        class="skill-group"
        :class="group.wide ? 'skill-group-wide' : ''"
      >
        <div class="skill-group-head">
          <p class="skill-number">S/{{ (i + 1).toString().padStart(2, "0") }}</p>
          <p class="skill-count">{{ group.items.length }} ✦</p>
        </div>
        <h3>{{ group.group }}</h3>
        <ul>
          <li v-for="item in group.items" :key="item">{{ item }}</li>
        </ul>
      </article>
    </div>
  </section>
</template>
