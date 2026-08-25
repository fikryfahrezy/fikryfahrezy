<script setup lang="ts">
const { data: now } = await useNow();
const { t } = useI18n();
</script>

<template>
  <section id="now" class="section-wrap section-block" tabindex="-1">
    <header class="section-heading">
      <p class="section-kicker">02 / {{ t("sections.now.eyebrow") }}</p>
      <h2>{{ t("sections.now.label") }}</h2>
    </header>

    <article class="now-card">
      <ParticleBackground />
      <div class="now-card-head">
        <div>
          <p class="meta-label">{{ t("now.currentPosition") }}</p>
          <h3>{{ now?.company }}</h3>
        </div>
        <p class="now-period">{{ now?.period }}</p>
      </div>
      <p class="now-role">{{ now?.role }} / {{ now?.location }}</p>
      <ContentRenderer v-if="now" :value="now" class="prose-points now-copy" />
      <ul class="tag-list tag-list-dark" :aria-label="t('skills.technologies')">
        <li v-for="tag in now?.tags" :key="tag">{{ tag }}</li>
      </ul>
    </article>
  </section>
</template>
