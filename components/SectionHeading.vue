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
