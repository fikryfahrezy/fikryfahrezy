<script setup lang="ts">
const { data: now } = await useNow();
const { t } = useI18n();
</script>

<template>
  <section id="now" class="section-wrap section-block" tabindex="-1">
    <SectionHeading
      index="02"
      :kicker="t('sections.now.eyebrow')"
      :title="t('sections.now.label')"
      glyph="現在"
    />

    <article v-reveal v-tilt="{ max: 2 }" class="now-card">
      <ParticleBackground />
      <div class="now-card-head">
        <div>
          <p class="panel-label">
            <span class="now-pulse" aria-hidden="true" />
            {{ t("now.currentPosition") }}
          </p>
          <h3>{{ now?.company }}</h3>
          <p class="now-role">{{ now?.role }} / {{ now?.location }}</p>
        </div>
        <p class="now-period">{{ now?.period }}</p>
      </div>
      <ContentRenderer v-if="now" :value="now" class="prose-points now-copy" />
      <ul class="tag-list tag-list-inverse" :aria-label="t('skills.technologies')">
        <li v-for="tag in now?.tags" :key="tag">{{ tag }}</li>
      </ul>
    </article>
  </section>
</template>

<style scoped>
.now-card {
  position: relative;
  display: grid;
  gap: 32px;
  padding: clamp(24px, 4vw, 56px);
  overflow: hidden;
  background: var(--panel);
  color: var(--panel-ink);
  box-shadow: var(--shadow);
}

.now-card > :not(.particle-field) {
  position: relative;
  z-index: 1;
}

.now-card-head {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  padding-bottom: 28px;
  border-bottom: 1px solid var(--panel-line);
}

.now-card h3 {
  margin-top: 14px;
  font-family: var(--display);
  font-size: clamp(42px, 6.5vw, 96px);
  font-weight: 800;
  letter-spacing: -0.05em;
  line-height: 0.9;
}

.now-role {
  margin-top: 14px;
  color: var(--panel-muted);
  font-family: var(--mono);
  font-size: 13px;
  letter-spacing: 0.04em;
}

.now-period {
  padding: 8px 12px;
  background: var(--comet);
  color: var(--on-comet);
  font-family: var(--mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.now-pulse {
  position: relative;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--comet);
}

.now-pulse::after {
  position: absolute;
  inset: -4px;
  border: 1px solid var(--comet);
  border-radius: 50%;
  content: "";
  animation: ping 1.8s var(--ease-out) infinite;
}

.now-copy {
  max-width: 82ch;
  font-size: clamp(15px, 1.15vw, 17px);
}

.prose-points :deep(ul) {
  display: grid;
  gap: 14px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.prose-points :deep(li) {
  position: relative;
  padding-left: 26px;
  line-height: 1.65;
}

.prose-points :deep(li)::before {
  position: absolute;
  top: 0;
  left: 0;
  color: var(--comet);
  content: "✦";
}

.prose-points :deep(strong) {
  font-weight: 600;
}

@keyframes ping {
  from {
    opacity: 1;
    transform: scale(0.6);
  }

  to {
    opacity: 0;
    transform: scale(2.2);
  }
}
</style>
