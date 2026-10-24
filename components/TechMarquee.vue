<script setup lang="ts">
// A comet-yellow ticker of every skill. It skews with scroll velocity
// (--scroll-velocity, set by plugins/interactions.ts) and pauses on hover.
const { data: skills } = await useSkills();

const items = computed(() => skills.value.flatMap((group) => group.items));
</script>

<template>
  <div class="tech-marquee" aria-hidden="true">
    <div class="tech-marquee-track">
      <ul v-for="copy in 2" :key="copy">
        <li v-for="item in items" :key="`${copy}-${item}`">
          {{ item }}<span>✦</span>
        </li>
      </ul>
    </div>
  </div>
</template>
