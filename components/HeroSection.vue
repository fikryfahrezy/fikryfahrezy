<script setup lang="ts">
import { profile } from "~/data/resume";
</script>

<template>
  <section
    data-section="hero"
    class="relative flex h-full w-screen shrink-0 flex-col justify-center gap-5 px-[9vw] pb-28 pt-20 md:gap-7"
  >
    <p class="hud-eyebrow">{{ profile.role }} · {{ profile.location }}</p>
    <h1
      class="max-w-5xl font-display text-[clamp(2.6rem,7.2vw,6.4rem)] font-600 leading-[1.04] tracking-[-0.02em] text-balance"
    >
      Fikry Fahrezy
      <span
        class="block bg-gradient-to-r from-[#8fd8ff] via-[#7ba6ff] to-[#f6c66d] bg-clip-text text-transparent"
      >
        Ramadhan ✦
      </span>
    </h1>
    <p class="max-w-xl text-base text-star-dim text-pretty md:text-lg">
      {{ profile.tagline }}
    </p>
  </section>
</template>
