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

<style scoped>
.education-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(14px, 2vw, 24px);
}

.education-card {
  position: relative;
  display: grid;
  grid-template-columns: 110px 1fr;
  min-height: 180px;
  border: 1px solid var(--line-strong);
  background: var(--paper-raised);
}

/* Ticket stub with a perforated edge. */
.education-stub {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 20px;
  background: var(--cobalt);
  color: var(--on-cobalt);
  font-family: var(--mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
}

.education-stub::after {
  position: absolute;
  top: 0;
  right: -5px;
  bottom: 0;
  width: 10px;
  background:
    radial-gradient(
      circle at 5px 8px,
      var(--paper-raised) 3.5px,
      transparent 4px
    )
    0 0 / 10px 16px repeat-y;
  content: "";
}

.education-stub strong {
  color: var(--comet);
  font-family: var(--display);
  font-size: 48px;
  font-weight: 800;
  letter-spacing: -0.05em;
  line-height: 1;
}

.education-body {
  display: grid;
  align-content: space-between;
  gap: 18px;
  padding: 24px 28px;
}

.education-body h3 {
  font-family: var(--display);
  font-size: clamp(22px, 2.2vw, 30px);
  font-weight: 800;
  letter-spacing: -0.035em;
  line-height: 1.1;
}

.education-body p:last-child {
  color: var(--muted);
}

@media (max-width: 800px) {
  .education-list {
    grid-template-columns: 1fr;
  }

  .education-card {
    grid-template-columns: 84px 1fr;
  }
}
</style>
