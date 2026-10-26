<script setup lang="ts">
// Opening block for the showcase pages: a giant index, the title with a
// kanji watermark, and a summary slot.
defineProps<{ index: string; kicker: string; title: string; glyph: string }>();
</script>

<template>
  <section class="page-header">
    <p class="page-header-index" aria-hidden="true">{{ index }}</p>
    <div class="page-header-title">
      <p class="section-kicker">
        <span class="kicker-plus" aria-hidden="true">+</span> {{ kicker }}
      </p>
      <h1>{{ title }}<span class="hero-star" aria-hidden="true">✦</span></h1>
      <span class="section-glyph" aria-hidden="true">{{ glyph }}</span>
    </div>
    <div class="page-header-summary">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.page-header {
  position: relative;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) minmax(240px, 0.7fr);
  gap: clamp(18px, 3vw, 48px);
  align-items: end;
  margin-bottom: clamp(48px, 7vw, 96px);
  padding-bottom: 32px;
  border-bottom: 1px solid var(--line-strong);
}

.page-header-index {
  color: transparent;
  font-family: var(--display);
  font-size: clamp(80px, 12vw, 180px);
  font-weight: 800;
  letter-spacing: -0.06em;
  line-height: 0.78;
  -webkit-text-stroke: 1px var(--line-strong);
}

.page-header-title {
  position: relative;
  display: grid;
  gap: 16px;
}

.page-header-title h1 {
  font-family: var(--display);
  font-size: clamp(52px, 8vw, 128px);
  font-weight: 800;
  letter-spacing: -0.055em;
  line-height: 0.88;
  animation: letter-rise 900ms var(--ease-out) backwards;
}

.page-header-title .section-glyph {
  right: auto;
  bottom: auto;
  top: -0.4em;
  left: 30%;
}

.page-header-summary {
  display: grid;
  gap: 10px;
  color: var(--muted);
  font-size: 15px;
  line-height: 1.6;
}

.page-header-summary :slotted(a) {
  color: var(--ink);
  border-bottom: 1px solid var(--accent);
}

.page-header-summary :slotted(a:hover) {
  color: var(--accent);
}

@media (max-width: 1080px) {
  .page-header {
    grid-template-columns: auto minmax(0, 1fr);
  }

  .page-header-summary {
    grid-column: 1 / -1;
  }
}

@media (max-width: 800px) {
  .page-header {
    grid-template-columns: 1fr;
  }

  .page-header-index {
    font-size: 72px;
  }
}
</style>
