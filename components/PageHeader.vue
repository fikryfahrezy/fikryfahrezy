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
