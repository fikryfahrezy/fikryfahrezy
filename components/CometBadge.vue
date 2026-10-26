<script setup lang="ts">
// A rotating seal — crown, star and ring text — in the spirit of the crown
// mark on Suisei's site. Clicking it calls a meteor shower down the
// StarField canvas.
const props = defineProps<{ ring: string; label: string }>();

const ringText = computed(() => `${props.ring} ✦ `);
const isFalling = ref(false);

// Spread the ring text with letter-spacing (which, unlike textLength, also
// pads the trailing space) so the gap where the ring wraps matches the rest.
const RING_CIRCUMFERENCE = 2 * Math.PI * 78;
const ringTextEl = ref<SVGTextElement>();
const ringSpacing = ref<string>();

async function fitRing() {
  ringSpacing.value = undefined;
  await nextTick();
  await document.fonts.ready;
  const el = ringTextEl.value;
  if (!el) return;
  const chars = el.getNumberOfChars();
  if (!chars) return;
  const base = Number.parseFloat(getComputedStyle(el).letterSpacing) || 0;
  const extra = (RING_CIRCUMFERENCE - el.getComputedTextLength()) / chars;
  ringSpacing.value = `${base + extra}px`;
}

onMounted(fitRing);
watch(ringText, fitRing);

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
        <!-- Whitespace is preserved so the trailing space after the last ✦
             survives into the gap where the ring wraps. -->
        <text
          ref="ringTextEl"
          xml:space="preserve"
          :style="{ letterSpacing: ringSpacing }"
        >
          <textPath href="#comet-badge-ring">{{ ringText }}</textPath>
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

<style scoped>
.comet-badge {
  position: relative;
  display: grid;
  place-items: center;
  width: clamp(190px, 18vw, 250px);
  aspect-ratio: 1;
  align-self: center;
  border: 0;
  padding: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--ink);
  cursor: pointer;
}

.comet-badge svg {
  width: 100%;
  height: 100%;
  overflow: visible;
}

.comet-badge-ring {
  transform-origin: 100px 100px;
  animation: spin 22s linear infinite;
}

.comet-badge-ring text {
  fill: currentColor;
  font-family: var(--mono);
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.comet-badge-disc {
  fill: var(--cobalt);
  transition: transform 500ms var(--ease-spring);
  transform-origin: 100px 100px;
}

.comet-badge-crown {
  fill: var(--on-cobalt);
  transform-origin: 100px 110px;
  transition: transform 500ms var(--ease-spring);
}

.comet-badge-star {
  fill: var(--comet);
  transform-origin: 100px 64px;
  animation: twinkle 3.2s ease-in-out infinite;
}

.comet-badge:hover .comet-badge-ring {
  animation-duration: 5s;
}

.comet-badge:hover .comet-badge-disc {
  transform: scale(1.08);
}

.comet-badge:hover .comet-badge-crown {
  transform: translateY(-4px) rotate(-6deg);
}

.comet-badge.is-falling .comet-badge-star {
  animation: star-launch 1.2s var(--ease-out);
}

.comet-badge:active .comet-badge-disc {
  transform: scale(0.94);
}

@keyframes star-launch {
  0% {
    transform: none;
  }

  40% {
    transform: translateY(-60px) scale(1.6) rotate(180deg);
    opacity: 0;
  }

  41% {
    transform: translateY(30px) scale(0.4);
    opacity: 0;
  }

  100% {
    transform: none;
    opacity: 1;
  }
}
</style>
