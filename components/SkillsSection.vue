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

<style scoped>
.skills-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: clamp(14px, 2vw, 24px);
}

.skill-group {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-height: 260px;
  padding: 26px;
  overflow: hidden;
  border: 1px solid var(--line-strong);
  background: var(--paper-raised);
}

/* Staggered tiles, echoing the offset blocks on Suisei's site. */
.skill-group:nth-child(3n + 2) {
  translate: 0 36px;
}

.skill-group-wide {
  grid-column: span 2;
}

.skill-group:nth-child(4n + 1) {
  border-color: var(--cobalt);
  background: var(--cobalt);
  color: var(--on-cobalt);
}

.skill-group:nth-child(4n + 1) .skill-number,
.skill-group:nth-child(4n + 1) .skill-count {
  color: var(--panel-muted);
}

.skill-group:nth-child(4n + 1) li {
  border-color: var(--panel-line);
}

.skill-group-head {
  display: flex;
  justify-content: space-between;
}

.skill-number,
.skill-count {
  color: var(--muted);
  font-family: var(--mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
}

.skill-group h3 {
  font-family: var(--display);
  font-size: clamp(28px, 2.6vw, 38px);
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1;
}

.skill-group ul {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: auto 0 0;
  padding: 0;
  list-style: none;
}

.skill-group li {
  padding: 6px 11px;
  border: 1px solid var(--line-strong);
  font-size: 13px;
  font-weight: 500;
  transition:
    background-color 180ms ease,
    color 180ms ease,
    border-color 180ms ease,
    transform 300ms var(--ease-spring);
}

.skill-group li:hover {
  border-color: var(--comet);
  background: var(--comet);
  color: var(--on-comet);
  transform: translateY(-3px) rotate(-2deg);
}

@media (max-width: 1080px) {
  .skills-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .skill-group:nth-child(3n + 2) {
    translate: none;
  }

  .skill-group:nth-child(2n) {
    translate: 0 28px;
  }
}

@media (max-width: 800px) {
  .skills-grid {
    grid-template-columns: 1fr;
  }

  .skill-group-wide {
    grid-column: auto;
  }

  .skill-group:nth-child(n) {
    translate: none;
  }
}
</style>
