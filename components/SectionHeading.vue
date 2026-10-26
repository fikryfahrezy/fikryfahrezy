<script setup lang="ts">
// Shared heading: index, "+ KICKER" label, the title, and a large kanji that
// sits behind it as a watermark.
defineProps<{
  index: string;
  kicker: string;
  title: string;
  glyph: string;
  as?: "h1" | "h2";
}>();
</script>

<template>
  <header v-reveal class="section-heading">
    <p class="section-index" aria-hidden="true">{{ index }}</p>
    <p class="section-kicker">
      <span class="kicker-plus" aria-hidden="true">+</span> {{ kicker }}
    </p>
    <component :is="as ?? 'h2'" class="section-title">{{ title }}</component>
    <span class="section-glyph" aria-hidden="true">{{ glyph }}</span>
  </header>
</template>

<style scoped>
.section-heading {
  position: relative;
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: auto auto;
  column-gap: clamp(16px, 3vw, 40px);
  align-items: end;
  margin-bottom: clamp(36px, 5vw, 64px);
  padding-bottom: 24px;
  border-bottom: 1px solid var(--line-strong);
}

.section-index {
  grid-row: span 2;
  color: transparent;
  font-family: var(--display);
  font-size: clamp(64px, 9vw, 132px);
  font-weight: 800;
  letter-spacing: -0.06em;
  line-height: 0.8;
  -webkit-text-stroke: 1px var(--line-strong);
}

.section-title {
  font-family: var(--display);
  font-size: clamp(44px, 7vw, 104px);
  font-weight: 800;
  letter-spacing: -0.05em;
  line-height: 0.9;
}

@media (max-width: 800px) {
  .section-heading {
    grid-template-columns: 1fr;
  }

  .section-index {
    grid-row: auto;
    font-size: 56px;
  }
}
</style>
