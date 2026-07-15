<script setup lang="ts">
import { skills } from "~/data/resume";
</script>

<template>
  <section
    data-section="skills"
    class="relative flex h-full w-max shrink-0 items-center px-[8vw] pb-28 pt-20 md:w-screen"
  >
    <div class="md:w-full md:max-w-4xl">
      <p class="hud-eyebrow mb-8">Star chart · skills</p>
      <div class="flex gap-4 md:grid md:grid-cols-2">
        <div
          v-for="group in skills"
          :key="group.group"
          class="glass-panel w-64 shrink-0 p-5 md:w-auto md:p-6"
          :class="group.group === 'Languages' ? 'md:col-span-2' : ''"
        >
          <h3
            class="font-display text-xs uppercase tracking-[0.18em] text-comet-cyan/80"
          >
            {{ group.group }}
          </h3>
          <ul class="mt-3 flex flex-wrap gap-2">
            <li v-for="item in group.items" :key="item" class="chip">{{ item }}</li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>
