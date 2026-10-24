<script setup lang="ts">
// Hovering the parent link deciphers the label through kana and star glyphs.
// The readable text stays in the accessibility tree; only the animated copy
// is hidden from assistive tech.
const props = defineProps<{ text: string }>();

const GLYPHS = "アイウエオカキクケコサシスセソタチツテト★☆✦✧+/";
const display = ref(props.text);
const root = ref<HTMLElement | null>(null);
let frame = 0;

watch(
  () => props.text,
  (text) => {
    display.value = text;
  },
);

function scramble() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  cancelAnimationFrame(frame);
  const target = props.text;
  const start = performance.now();
  const duration = 420;

  const step = (now: number) => {
    const progress = Math.min(1, (now - start) / duration);
    const settled = Math.floor(progress * target.length);
    display.value = [...target]
      .map((char, i) =>
        i < settled || char === " "
          ? char
          : GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
      )
      .join("");
    if (progress < 1) frame = requestAnimationFrame(step);
  };
  frame = requestAnimationFrame(step);
}

onMounted(() => {
  root.value?.parentElement?.addEventListener("pointerenter", scramble);
  root.value?.parentElement?.addEventListener("focus", scramble);
});

onBeforeUnmount(() => {
  cancelAnimationFrame(frame);
  root.value?.parentElement?.removeEventListener("pointerenter", scramble);
  root.value?.parentElement?.removeEventListener("focus", scramble);
});
</script>

<template>
  <span ref="root" class="scramble">
    <span class="sr-only">{{ text }}</span>
    <span class="scramble-display" aria-hidden="true">{{ display }}</span>
  </span>
</template>
