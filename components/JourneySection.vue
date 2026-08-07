<script setup lang="ts">
const { data: journey } = await useJourney();
const { t } = useI18n();
</script>

<template>
  <section id="journey" class="section-wrap section-block">
    <header class="section-heading">
      <p class="section-kicker">03 / {{ t("sections.journey.eyebrow") }}</p>
      <h2>{{ t("sections.journey.label") }}</h2>
    </header>

    <div class="journey-list">
      <article v-for="(stop, i) in journey" :key="stop.id" class="journey-row">
        <p class="journey-number">{{ (i + 1).toString().padStart(2, "0") }}</p>
        <div class="journey-identity">
          <p class="meta-label">{{ stop.period }}</p>
          <h3>{{ stop.company }}</h3>
          <p>{{ stop.role }}</p>
          <p>{{ stop.location }}</p>
        </div>
        <div class="journey-detail">
          <ContentRenderer :value="stop" class="prose-points" />
          <p v-if="stop.clients" class="client-list">
            {{ stop.clients.join(" / ") }}
          </p>
          <ul class="tag-list" :aria-label="t('skills.technologies')">
            <li v-for="tag in stop.tags" :key="tag">{{ tag }}</li>
          </ul>
        </div>
      </article>
    </div>
  </section>
</template>
