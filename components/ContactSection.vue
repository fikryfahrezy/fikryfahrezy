<script setup lang="ts">
const { data: profile } = await useProfile();
const { t } = useI18n();
</script>

<template>
  <section id="contact" class="contact-section section-wrap section-block">
    <header class="section-heading contact-heading">
      <p class="section-kicker">06 / {{ t("sections.contact.eyebrow") }}</p>
      <h2>{{ t("contact.title") }}</h2>
    </header>

    <div class="contact-grid">
      <div class="contact-primary">
        <a class="contact-email" :href="`mailto:${profile?.email}`">{{ profile?.email }}&nbsp;↗</a>
      </div>

      <div class="contact-secondary">
        <a :href="profile?.website" target="_blank" rel="noreferrer">
          fahrezy.work ↗
        </a>
        <a :href="profile?.github" target="_blank" rel="noreferrer">GitHub ↗</a>
        <a :href="profile?.linkedin" target="_blank" rel="noreferrer">
          LinkedIn ↗
        </a>
      </div>

    </div>
  </section>
</template>
