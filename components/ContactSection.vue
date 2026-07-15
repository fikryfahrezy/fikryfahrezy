<script setup lang="ts">
import { education, profile } from "~/data/resume";
</script>

<template>
  <section
    data-section="contact"
    class="relative flex h-full w-screen shrink-0 flex-col justify-center gap-7 px-[9vw] pb-28 pt-20"
  >
    <p class="hud-eyebrow">Send a signal</p>
    <a
      :href="`mailto:${profile.email}`"
      class="group w-fit break-all font-display text-[clamp(1.4rem,4.6vw,3.6rem)] font-600 leading-tight tracking-[-0.015em] text-star"
    >
      {{ profile.email }}
      <span
        class="block h-[2px] max-w-0 bg-gradient-to-r from-comet-cyan to-comet-gold transition-[max-width] duration-500 group-hover:max-w-full"
        aria-hidden="true"
      />
    </a>
    <div class="flex flex-wrap gap-3">
      <a
        class="contact-link"
        :href="profile.github"
        target="_blank"
        rel="noreferrer"
      >
        GitHub <span aria-hidden="true">↗</span>
      </a>
      <a
        class="contact-link"
        :href="profile.linkedin"
        target="_blank"
        rel="noreferrer"
      >
        LinkedIn <span aria-hidden="true">↗</span>
      </a>
    </div>
    <div class="glass-panel w-fit max-w-md p-5">
      <p class="font-display text-[11px] uppercase tracking-[0.2em] text-comet-cyan/70">
        Education
      </p>
      <p class="mt-2 text-star">{{ education.school }}</p>
      <p class="text-sm text-star-dim">{{ education.degree }}</p>
      <p class="mt-1 text-sm text-comet-gold/80">{{ education.period }}</p>
    </div>
    <p class="text-sm text-star-dim/90">
      End of this orbit — keep scrolling and it begins again
      <span class="text-comet-gold">∞</span>
    </p>
  </section>
</template>
