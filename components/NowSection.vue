<script setup lang="ts">
import { now } from "~/data/resume";
</script>

<template>
  <section
    data-section="now"
    class="relative flex h-full w-screen shrink-0 items-center px-[8vw] pb-28 pt-20"
  >
    <div class="w-full max-w-2xl">
      <p class="hud-eyebrow mb-6">Current orbit</p>
      <div class="glass-panel p-6 md:p-9">
        <div class="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h2 class="font-display text-2xl font-600 text-star md:text-3xl">
            {{ now.company }}
          </h2>
          <p class="text-sm text-comet-gold">{{ now.period }}</p>
        </div>
        <p class="mt-1 text-sm text-star-dim">{{ now.role }} · {{ now.location }}</p>
        <ul class="mt-6 space-y-3">
          <li
            v-for="point in now.points"
            :key="point"
            class="flex gap-3 text-sm text-star-dim md:text-base"
          >
            <span
              class="mt-[8px] h-1 w-1 shrink-0 rounded-full bg-comet-cyan"
              aria-hidden="true"
            />
            <span class="text-pretty">{{ point }}</span>
          </li>
        </ul>
        <ul class="mt-7 flex flex-wrap gap-2">
          <li v-for="tag in now.tags" :key="tag" class="chip">{{ tag }}</li>
        </ul>
      </div>
    </div>
  </section>
</template>
