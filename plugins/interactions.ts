import type { Directive } from "vue";

// Small, dependency-free interaction layer shared by every page:
//   v-reveal   — clip/fade elements in as they enter the viewport.
//   v-tilt     — 3D tilt plus a cursor spotlight (--mx / --my) on cards.
//   v-magnetic — buttons and links lean toward the pointer.
// It also publishes scroll progress and velocity as CSS variables on <html>
// so purely CSS effects (the progress comet, the skewing marquee) can react.

type TiltOptions = { max?: number };

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const hasFinePointer = () => window.matchMedia("(pointer: fine)").matches;

let revealObserver: IntersectionObserver | undefined;

function getRevealObserver() {
  revealObserver ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const target = entry.target as HTMLElement;
        target.classList.add("is-revealed");
        revealObserver?.unobserve(target);
        // Drop the classes once the entrance is over so their transition
        // delay does not linger on later hover effects such as v-tilt.
        const delay = Number.parseInt(
          target.style.getPropertyValue("--reveal-delay") || "0",
          10,
        );
        window.setTimeout(
          () => target.classList.remove("reveal", "is-revealed"),
          delay + 1000,
        );
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
  );
  return revealObserver;
}

const reveal: Directive<HTMLElement, number | undefined> = {
  getSSRProps: () => ({}),
  mounted(el, binding) {
    if (binding.value)
      el.style.setProperty("--reveal-delay", `${binding.value}ms`);

    // Anything already on screen at hydration stays put; hiding it now would
    // flash content the visitor is already reading.
    const { top } = el.getBoundingClientRect();
    if (prefersReducedMotion() || top < window.innerHeight * 0.92) return;

    el.classList.add("reveal");
    getRevealObserver().observe(el);
  },
  unmounted(el) {
    revealObserver?.unobserve(el);
  },
};

const pointerCleanup = new WeakMap<HTMLElement, () => void>();

const tilt: Directive<HTMLElement, TiltOptions | undefined> = {
  getSSRProps: () => ({}),
  mounted(el, binding) {
    if (!hasFinePointer() || prefersReducedMotion()) return;
    const max = binding.value?.max ?? 7;
    let frame = 0;

    const onMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        el.style.setProperty("--mx", `${(x * 100).toFixed(1)}%`);
        el.style.setProperty("--my", `${(y * 100).toFixed(1)}%`);
        el.style.setProperty("--ry", `${((x - 0.5) * max * 2).toFixed(2)}deg`);
        el.style.setProperty("--rx", `${((0.5 - y) * max * 2).toFixed(2)}deg`);
      });
    };
    const onLeave = () => {
      cancelAnimationFrame(frame);
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
    };

    el.classList.add("tilt");
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    pointerCleanup.set(el, () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    });
  },
  unmounted(el) {
    pointerCleanup.get(el)?.();
  },
};

const magnetic: Directive<HTMLElement, number | undefined> = {
  getSSRProps: () => ({}),
  mounted(el, binding) {
    if (!hasFinePointer() || prefersReducedMotion()) return;
    const strength = binding.value ?? 0.32;

    const onMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      el.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`;
    };
    const onLeave = () => {
      el.style.transform = "";
    };

    el.classList.add("magnetic");
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    pointerCleanup.set(el, () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    });
  },
  unmounted(el) {
    pointerCleanup.get(el)?.();
  },
};

function trackScroll() {
  const root = document.documentElement;
  let lastY = window.scrollY;
  let velocity = 0;
  let frame = 0;

  const tick = () => {
    const y = window.scrollY;
    const max = root.scrollHeight - window.innerHeight;
    velocity += (y - lastY - velocity) * 0.18;
    lastY = y;
    root.style.setProperty(
      "--scroll-progress",
      (max > 0 ? y / max : 0).toFixed(4),
    );
    root.style.setProperty(
      "--scroll-velocity",
      Math.max(-1, Math.min(1, velocity / 40)).toFixed(3),
    );
    // Keep easing back to zero after the last scroll event.
    frame = Math.abs(velocity) > 0.05 ? requestAnimationFrame(tick) : 0;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (!frame) frame = requestAnimationFrame(tick);
    },
    { passive: true },
  );
  tick();
}

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive("reveal", reveal);
  nuxtApp.vueApp.directive("tilt", tilt);
  nuxtApp.vueApp.directive("magnetic", magnetic);

  if (import.meta.client) nuxtApp.hook("app:mounted", trackScroll);
});
