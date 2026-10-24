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
