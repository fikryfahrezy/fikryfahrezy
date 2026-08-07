<script setup lang="ts">
const { data: skills } = await useSkills();
const { t } = useI18n();
</script>

<template>
  <section id="skills" class="section-wrap section-block">
    <header class="section-heading">
      <p class="section-kicker">04 / {{ t("sections.skills.eyebrow") }}</p>
      <h2>{{ t("sections.skills.label") }}</h2>
    </header>

    <div class="skills-grid">
      <article
        v-for="(group, i) in skills"
        :key="group.id"
        class="skill-group"
        :class="group.wide ? 'skill-group-wide' : ''"
      >
        <p class="skill-number">S/{{ (i + 1).toString().padStart(2, "0") }}</p>
        <h3>{{ group.group }}</h3>
        <ul>
          <li v-for="item in group.items" :key="item">{{ item }}</li>
        </ul>
      </article>
    </div>
  </section>
</template>
