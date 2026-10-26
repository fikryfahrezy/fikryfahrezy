<script setup lang="ts">
const { data: journey } = await useJourney();
const { data: now } = await useNow();
const { t } = useI18n();

const pastJourney = computed(() =>
  journey.value.filter(
    (stop) =>
      stop.company !== now.value?.company || stop.role !== now.value?.role,
  ),
);
</script>

<template>
  <section id="journey" class="section-wrap section-block">
    <SectionHeading
      index="03"
      :kicker="t('sections.journey.eyebrow')"
      :title="t('sections.journey.label')"
      glyph="軌跡"
    />

    <ol class="journey-list" role="list">
      <li
        v-for="(stop, i) in pastJourney"
        :key="stop.id"
        v-reveal="i * 60"
        class="journey-row"
      >
        <span class="journey-number" aria-hidden="true">
          {{ (i + 1).toString().padStart(2, "0") }}
        </span>
        <div class="journey-identity">
          <p class="meta-label">{{ stop.period }}</p>
          <h3>{{ stop.company }}</h3>
          <p class="journey-role">{{ stop.role }}</p>
          <p v-if="stop.clients?.length" class="client-list">
            {{ stop.clients.join(" / ") }}
          </p>
        </div>
        <ul class="tag-list" :aria-label="t('skills.technologies')">
          <li v-for="tag in stop.tags" :key="tag">{{ tag }}</li>
        </ul>
        <p class="journey-location">{{ stop.location }}</p>
      </li>
    </ol>
  </section>
</template>

<style scoped>
.journey-list {
  margin: 0;
  padding: 0;
  list-style: none;
  border-top: 1px solid var(--line-strong);
}

.journey-row {
  position: relative;
  display: grid;
  grid-template-columns: 80px minmax(0, 1.3fr) minmax(0, 1fr) 160px;
  gap: 24px;
  align-items: center;
  padding: 28px 20px;
  overflow: hidden;
  border-bottom: 1px solid var(--line-strong);
  isolation: isolate;
  transition: color 300ms ease;
}

/* A cobalt block slides in from the left on hover, like a tile flipping in
   on Suisei's site. */
.journey-row::before {
  position: absolute;
  z-index: -1;
  inset: 0;
  background: var(--cobalt);
  content: "";
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 520ms var(--ease-out);
}

.journey-row:hover {
  color: var(--on-cobalt);
}

.journey-row:hover::before {
  transform: scaleX(1);
}

.journey-row:hover .meta-label,
.journey-row:hover .journey-role,
.journey-row:hover .client-list,
.journey-row:hover .journey-location {
  color: var(--panel-muted);
}

.journey-row:hover .journey-number {
  color: var(--comet);
  -webkit-text-stroke-color: var(--comet);
  transform: translateX(6px);
}

.journey-row:hover .tag-list li {
  border-color: var(--panel-line);
  color: var(--on-cobalt);
}

.journey-number {
  color: transparent;
  font-family: var(--display);
  font-size: 56px;
  font-weight: 800;
  letter-spacing: -0.05em;
  line-height: 1;
  -webkit-text-stroke: 1px var(--line-strong);
  transition:
    color 300ms ease,
    transform 450ms var(--ease-spring);
}

.journey-identity {
  display: grid;
  gap: 6px;
}

.journey-identity h3 {
  font-family: var(--display);
  font-size: clamp(26px, 2.8vw, 40px);
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1;
}

.journey-role {
  color: var(--muted);
  font-size: 15px;
}

.client-list {
  color: var(--muted);
  font-family: var(--mono);
  font-size: 11px;
}

.journey-location {
  justify-self: end;
  color: var(--muted);
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.08em;
  text-align: right;
  text-transform: uppercase;
}

@media (max-width: 1080px) {
  .journey-row {
    grid-template-columns: 64px minmax(0, 1fr) 140px;
  }

  .journey-row .tag-list {
    grid-column: 2 / -1;
    grid-row: 2;
  }
}

@media (max-width: 800px) {
  .journey-row {
    grid-template-columns: 1fr;
    gap: 14px;
    padding: 22px 12px;
  }

  .journey-number {
    font-size: 40px;
  }

  .journey-row .tag-list {
    grid-column: auto;
    grid-row: auto;
  }

  .journey-location {
    justify-self: start;
    text-align: left;
  }
}
</style>
