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

<style scoped>
.tech-marquee {
  position: relative;
  z-index: 2;
  overflow: hidden;
  margin-block: clamp(10px, 3vw, 30px);
  padding-block: 18px;
  background: var(--comet);
  color: var(--on-comet);
  transform: rotate(-2deg) skewX(calc(var(--scroll-velocity, 0) * -12deg));
  transition: transform 300ms var(--ease-out);
  box-shadow: 0 0 0 1px var(--comet);
}

.theme-light .tech-marquee {
  background: var(--cobalt);
  color: var(--on-cobalt);
  box-shadow: 0 0 0 1px var(--cobalt);
}

.tech-marquee-track {
  display: flex;
  width: max-content;
  animation: marquee 48s linear infinite;
}

.tech-marquee:hover .tech-marquee-track {
  animation-play-state: paused;
}

.tech-marquee ul {
  display: flex;
  margin: 0;
  padding: 0;
  list-style: none;
}

.tech-marquee li {
  display: inline-flex;
  align-items: center;
  gap: 28px;
  padding-right: 28px;
  font-family: var(--display);
  font-size: clamp(24px, 3vw, 40px);
  font-weight: 800;
  letter-spacing: -0.03em;
  text-transform: uppercase;
  white-space: nowrap;
}

.tech-marquee li span {
  font-size: 0.6em;
}

@keyframes marquee {
  to {
    transform: translateX(-50%);
  }
}

@media (max-width: 800px) {
  .tech-marquee {
    transform: rotate(-2deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .tech-marquee {
    transform: rotate(-2deg);
  }
}
</style>
