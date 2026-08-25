<script setup lang="ts">
function createSeededRandom(seed: number) {
  let state = seed;

  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

const random = createSeededRandom(2608);
const particles = Array.from({ length: 32 }, (_, index) => {
  const angle = random() * Math.PI * 2;
  const distance = 36 + random() * 96;

  return {
    id: index,
    style: {
      "--particle-x": `${(random() * 100).toFixed(2)}%`,
      "--particle-y": `${(random() * 100).toFixed(2)}%`,
      "--particle-size": `${(2 + random() * 3).toFixed(2)}px`,
      "--particle-opacity": (0.2 + random() * 0.55).toFixed(2),
      "--particle-duration": `${(8 + random() * 14).toFixed(2)}s`,
      "--particle-delay": `${(-random() * 18).toFixed(2)}s`,
      "--particle-dx": `${(Math.cos(angle) * distance).toFixed(2)}px`,
      "--particle-dy": `${(Math.sin(angle) * distance).toFixed(2)}px`,
    },
  };
});
</script>

<template>
  <div class="particle-field" aria-hidden="true">
    <span
      v-for="particle in particles"
      :key="particle.id"
      class="particle"
      :style="particle.style"
    />
  </div>
</template>
