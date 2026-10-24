<script setup lang="ts">
const { data: profile } = await useProfile();
const { t } = useI18n();
</script>

<template>
  <section id="contact" class="contact-section section-wrap section-block">
    <SectionHeading
      index="06"
      :kicker="t('sections.contact.eyebrow')"
      :title="t('contact.title')"
      glyph="交信"
    />

    <div v-reveal class="contact-panel">
      <p class="contact-prompt">{{ t("contact.prompt") }}</p>
      <a class="contact-email" :href="`mailto:${profile?.email}`">
        <span>{{ profile?.email }}</span>
        <span class="contact-email-arrow" aria-hidden="true">↗</span>
      </a>
      <div class="contact-secondary">
        <a v-magnetic class="button button-ghost" :href="profile?.github" target="_blank" rel="noreferrer">
          GitHub <span aria-hidden="true">↗</span>
        </a>
        <a v-magnetic class="button button-ghost" :href="profile?.linkedin" target="_blank" rel="noreferrer">
          LinkedIn <span aria-hidden="true">↗</span>
        </a>
      </div>
    </div>
  </section>
</template>
