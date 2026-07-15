<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watchEffect } from "vue";
import { profile } from "~/data/resume";

const rootEl = ref<HTMLElement | null>(null);
const trackEl = ref<HTMLElement | null>(null);
const copyEl = ref<HTMLElement | null>(null);
const progressEl = ref<HTMLElement | null>(null);

const { state, scrollToOffset } = useLoopScroll(rootEl, copyEl);

const SECTION_LABELS: Record<string, string> = {
  hero: "Intro",
  now: "Now",
  journey: "Journey",
  skills: "Skills",
  contact: "Contact",
};

type SectionInfo = { id: string; label: string; left: number; width: number };
const sections = ref<SectionInfo[]>([]);

function measureSections() {
  const copy = copyEl.value;
  if (!copy) return;
  sections.value = Array.from(
    copy.querySelectorAll<HTMLElement>("[data-section]"),
  ).map((el) => ({
    id: el.dataset.section ?? "",
    label: SECTION_LABELS[el.dataset.section ?? ""] ?? "",
    left: el.offsetLeft,
    width: el.offsetWidth,
  }));
}

const activeIndex = computed(() => {
  const list = sections.value;
  if (list.length === 0) return 0;
  const width = state.trackWidth;
  const center = (state.wrapped + window.innerWidth / 2) % width;
  const index = list.findIndex(
    (section) =>
      center >= section.left && center < section.left + section.width,
  );
  return index === -1 ? 0 : index;
});

watchEffect(() => {
  const track = trackEl.value;
  if (track) {
    track.style.transform = `translate3d(${-state.wrapped}px, 0, 0)`;
  }
});

watchEffect(() => {
  const bar = progressEl.value;
  if (bar) {
    bar.style.transform = `scaleX(${state.progress})`;
  }
});

// Keyboard focus inside the track (e.g. tabbing to a link) should bring the
// section into view — the browser can't scroll a transform-driven layout.
function onFocusIn(event: FocusEvent) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const section = target.closest<HTMLElement>("[data-section]");
  if (section) scrollToOffset(section.offsetLeft);
}

onMounted(() => {
  measureSections();
  window.addEventListener("resize", measureSections);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", measureSections);
});

useHead({
  htmlAttrs: { lang: "en" },
  title: "Fikry Fahrezy Ramadhan — Software Developer",
  meta: [{ name: "theme-color", content: "#04060f" }],
});

useSeoMeta({
  description:
    "Personal site of Fikry Fahrezy Ramadhan — a full-stack developer working across React, Vue, Go, and more. An endless scroll through five years of remote orbits.",
  ogTitle: "Fikry Fahrezy Ramadhan — Software Developer",
  ogDescription:
    "Full-stack developer drifting between frontends that feel alive and backends that hold steady.",
});
</script>

<template>
  <div
    ref="rootEl"
    class="fixed inset-0 touch-pan-y overflow-clip bg-space text-star"
    :class="state.dragging ? 'cursor-grabbing select-none' : 'cursor-grab'"
    @dragstart.prevent
  >
    <NuxtRouteAnnouncer />
    <ClientOnly>
      <SpaceCanvas :view="state" />
    </ClientOnly>

    <div
      ref="trackEl"
      class="absolute inset-y-0 left-0 flex h-full w-max will-change-transform"
      @focusin="onFocusIn"
    >
      <div ref="copyEl" class="flex h-full w-max">
        <HeroSection />
        <NowSection />
        <JourneySection />
        <SkillsSection />
        <ContactSection />
      </div>
      <div class="flex h-full w-max" aria-hidden="true" inert>
        <HeroSection />
        <NowSection />
        <JourneySection />
        <SkillsSection />
        <ContactSection />
      </div>
    </div>

    <header
      class="fixed inset-x-0 top-0 z-20 flex items-center justify-between px-4 py-3 md:px-8 md:py-5"
    >
      <button
        type="button"
        class="inline-flex h-10 min-w-10 items-center px-2 font-display text-lg font-600 tracking-tight text-star"
        aria-label="Back to start"
        @click="scrollToOffset(0)"
      >
        FF<span class="text-comet-gold">✦</span>
      </button>
      <nav class="flex items-center" aria-label="Profiles">
        <a class="hud-link" :href="profile.github" target="_blank" rel="noreferrer">
          GitHub
        </a>
        <a class="hud-link" :href="profile.linkedin" target="_blank" rel="noreferrer">
          LinkedIn
        </a>
        <a class="hud-link" :href="`mailto:${profile.email}`">Email</a>
      </nav>
    </header>

    <nav
      class="fixed bottom-4 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-1 md:bottom-6"
      aria-label="Sections"
    >
      <p
        class="font-display text-[11px] uppercase tracking-[0.3em] text-star-dim"
        aria-live="polite"
      >
        {{ sections[activeIndex]?.label }}
      </p>
      <div class="flex">
        <button
          v-for="(section, i) in sections"
          :key="section.id"
          type="button"
          class="group grid h-10 w-10 place-items-center"
          :aria-label="`Go to ${section.label}`"
          :aria-current="i === activeIndex ? 'true' : undefined"
          @click="scrollToOffset(section.left)"
        >
          <span
            class="h-1.5 rounded-full transition-[width,background-color] duration-300"
            :class="
              i === activeIndex
                ? 'w-6 bg-comet-gold'
                : 'w-1.5 bg-star-dim/50 group-hover:bg-star-dim'
            "
          />
        </button>
      </div>
    </nav>

    <p
      class="pointer-events-none fixed bottom-5 right-5 z-20 hidden items-center gap-2 font-display text-[11px] uppercase tracking-[0.25em] text-star-dim transition-opacity duration-700 md:bottom-7 md:right-8 md:flex"
      :class="state.interacted ? 'opacity-0' : 'opacity-100'"
      aria-hidden="true"
    >
      scroll · drag · ← → <span class="hint-arrow text-comet-cyan">→</span>
    </p>

    <div class="fixed inset-x-0 bottom-0 z-20 h-0.5 bg-star/5">
      <div
        ref="progressEl"
        class="h-full w-full origin-left bg-gradient-to-r from-comet-cyan/60 to-comet-gold/60"
        style="transform: scaleX(0)"
      />
    </div>
  </div>
</template>