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
    <header class="section-heading">
      <p class="section-kicker">03 / {{ t("sections.journey.eyebrow") }}</p>
      <h2>{{ t("sections.journey.label") }}</h2>
    </header>

    <ol class="journey-list" role="list">
      <li v-for="(stop, i) in pastJourney" :key="stop.id" class="journey-row">
        <div class="journey-date">
          <span class="journey-number">{{ (i + 1).toString().padStart(2, "0") }}</span>
          <p class="meta-label">{{ stop.period }}</p>
        </div>
        <div class="journey-identity">
          <h3>{{ stop.company }}</h3>
          <p class="journey-role">{{ stop.role }}</p>
          <p v-if="stop.clients?.length" class="client-list">
            {{ stop.clients.join(" / ") }}
          </p>
          <ul class="tag-list" :aria-label="t('skills.technologies')">
            <li v-for="tag in stop.tags" :key="tag">{{ tag }}</li>
          </ul>
        </div>
        <p class="journey-location">{{ stop.location }}</p>
      </li>
    </ol>
  </section>
</template>
