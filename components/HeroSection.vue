<script setup lang="ts">
const { data: profile } = await useProfile();
const { t } = useI18n();
</script>

<template>
  <section id="top" class="hero section-wrap">
    <div class="hero-index" aria-hidden="true">01</div>
    <div class="hero-copy">
      <p class="section-kicker">
        {{ profile?.role }} <span>/</span> {{ profile?.location }}
      </p>
      <h1>
        <span class="hero-name-lead">{{ profile?.nameLead }}</span>
        <span class="hero-name-trail">{{ profile?.nameTrail }}</span>
      </h1>
      <ContentRenderer v-if="profile" :value="profile" class="hero-intro" />
      <div class="hero-actions">
        <a :href="`mailto:${profile?.email}`">{{ t("hero.startConversation") }} ↗</a>
        <a :href="profile?.github" target="_blank" rel="noreferrer">GitHub ↗</a>
        <a :href="profile?.linkedin" target="_blank" rel="noreferrer">LinkedIn ↗</a>
        <a
          href="/fikry-fahrezy-ramadhan-resume.pdf"
          target="_blank"
          rel="noreferrer"
        >
          {{ t("hero.downloadResume") }} ↓
        </a>
      </div>
    </div>

    <aside class="hero-facts" :aria-label="t('hero.quickFacts')">
      <div>
        <strong>{{ profile?.yearsExperience }}</strong>
        <span>{{ t("hero.years") }}</span>
      </div>
      <div>
        <strong>∞</strong>
        <span>{{ t("hero.remote") }}</span>
      </div>
      <div>
        <strong>ID</strong>
        <span>{{ t("hero.based") }}</span>
      </div>
    </aside>
  </section>
</template>
