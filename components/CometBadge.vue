<script setup lang="ts">
// A rotating seal — crown, star and ring text — in the spirit of the crown
// mark on Suisei's site. Clicking it calls a meteor shower down the
// StarField canvas.
const props = defineProps<{ ring: string; label: string }>();

const ringText = computed(() => `${props.ring} ✦ `);
const isFalling = ref(false);

function callStarfall() {
  window.dispatchEvent(new CustomEvent("starfall"));
  isFalling.value = true;
  window.setTimeout(() => {
    isFalling.value = false;
  }, 1400);
}
</script>

<template>
  <button
    v-magnetic="0.18"
    class="comet-badge"
    :class="{ 'is-falling': isFalling }"
    type="button"
    :aria-label="label"
    :title="label"
    @click="callStarfall"
  >
    <svg viewBox="0 0 200 200" aria-hidden="true">
      <defs>
        <path
          id="comet-badge-ring"
          d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0"
        />
      </defs>
      <g class="comet-badge-ring">
        <text>
          <textPath href="#comet-badge-ring" textLength="486">
            {{ ringText }}
          </textPath>
        </text>
      </g>
      <circle class="comet-badge-disc" cx="100" cy="100" r="58" />
      <g class="comet-badge-crown">
        <path d="M70 120 L74 92 L86 106 L100 84 L114 106 L126 92 L130 120 Z" />
        <rect x="70" y="124" width="60" height="6" />
      </g>
      <path
        class="comet-badge-star"
        d="M100 50 L103.5 60.5 L114 64 L103.5 67.5 L100 78 L96.5 67.5 L86 64 L96.5 60.5 Z"
      />
    </svg>
  </button>
</template>
