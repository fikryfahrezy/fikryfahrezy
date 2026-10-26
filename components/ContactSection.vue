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

<style scoped>
.contact-section {
  padding-bottom: clamp(80px, 10vw, 140px);
}

.contact-panel {
  display: grid;
  gap: clamp(24px, 3vw, 40px);
}

.contact-prompt {
  max-width: 40ch;
  color: var(--muted);
  font-size: clamp(17px, 1.6vw, 22px);
  line-height: 1.5;
}

.contact-email {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.2em;
  width: fit-content;
  max-width: 100%;
  font-family: var(--display);
  font-size: clamp(30px, 6.4vw, 104px);
  font-weight: 800;
  letter-spacing: -0.05em;
  line-height: 1;
  overflow-wrap: anywhere;
}

.contact-email::after {
  position: absolute;
  bottom: -0.08em;
  left: 0;
  width: 100%;
  height: 0.12em;
  background: var(--comet);
  content: "";
  transform: scaleX(0.12);
  transform-origin: left;
  transition: transform 650ms var(--ease-out);
}

.theme-light .contact-email::after {
  background: var(--cobalt);
}

.contact-email:hover::after {
  transform: scaleX(1);
}

.contact-email-arrow {
  display: inline-block;
  color: var(--accent);
  transition: transform 450ms var(--ease-spring);
}

.contact-email:hover .contact-email-arrow {
  transform: translate(0.1em, -0.1em) rotate(8deg);
}

.contact-secondary {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

/* Outside of a cobalt panel, ghost buttons sit on the page background. */
.contact-secondary .button-ghost {
  border-color: var(--line-strong);
  color: var(--ink);
}

.contact-secondary .button-ghost:hover {
  border-color: var(--cobalt);
  background: var(--cobalt);
  color: var(--on-cobalt);
}
</style>
