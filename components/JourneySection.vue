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
