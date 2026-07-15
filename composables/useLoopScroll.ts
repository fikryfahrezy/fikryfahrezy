import { onBeforeUnmount, onMounted, reactive, type Ref } from "vue";

export type LoopScrollState = {
  /** Continuous, unbounded scroll position in px. */
  scroll: number;
  /** Scroll wrapped into [0, trackWidth). Drives the DOM track transform. */
  wrapped: number;
  /** Smoothed velocity in px/s. */
  velocity: number;
  /** wrapped / trackWidth, in [0, 1). */
  progress: number;
  trackWidth: number;
  dragging: boolean;
  interacted: boolean;
  reducedMotion: boolean;
};

const SMOOTH_RATE = 7;
const VELOCITY_SMOOTH_RATE = 14;
const DRAG_THRESHOLD_PX = 8;
const WHEEL_MAX_STEP_PX = 260;
// Apple's momentum projection: (v / 1000) * rate / (1 - rate)
const PROJECTION_RATE = 0.998;
const RENORMALIZE_LIMIT = 1e9;

function projectMomentum(velocityPxPerSec: number): number {
  return ((velocityPxPerSec / 1000) * PROJECTION_RATE) / (1 - PROJECTION_RATE);
}

export function useLoopScroll(
  root: Ref<HTMLElement | null>,
  measure: Ref<HTMLElement | null>,
) {
  const state = reactive<LoopScrollState>({
    scroll: 0,
    wrapped: 0,
    velocity: 0,
    progress: 0,
    trackWidth: 1,
    dragging: false,
    interacted: false,
    reducedMotion: false,
  });

  let target = 0;
  let current = 0;
  let rafId = 0;
  let lastTime = 0;

  let activePointer = -1;
  let startX = 0;
  let startY = 0;
  let anchorX = 0;
  let anchorScroll = 0;
  let dragCommitted = false;
  const samples: Array<{ time: number; x: number }> = [];

  function measureTrack() {
    state.trackWidth = Math.max(1, measure.value?.scrollWidth ?? 1);
  }

  function markInteracted() {
    if (!state.interacted) state.interacted = true;
  }

  function pushSample(x: number) {
    const time = performance.now();
    samples.push({ time, x });
    while (samples.length > 2 && time - samples[0].time > 120) {
      samples.shift();
    }
  }

  function releaseVelocity(): number {
    if (samples.length < 2) return 0;
    const first = samples[0];
    const last = samples[samples.length - 1];
    const dt = last.time - first.time;
    if (dt <= 0) return 0;
    return ((last.x - first.x) / dt) * 1000;
  }

  function onWheel(event: WheelEvent) {
    event.preventDefault();
    const unit =
      event.deltaMode === 1
        ? 16
        : event.deltaMode === 2
          ? window.innerWidth
          : 1;
    const dx = event.deltaX * unit;
    const dy = event.deltaY * unit;
    const delta = Math.abs(dx) > Math.abs(dy) ? dx : dy;
    target += Math.max(-WHEEL_MAX_STEP_PX, Math.min(WHEEL_MAX_STEP_PX, delta));
    markInteracted();
  }

  function isInteractiveTarget(target: EventTarget | null): boolean {
    return (
      target instanceof Element &&
      target.closest(
        "a, button, input, textarea, select, [contenteditable]",
      ) !== null
    );
  }

  function onPointerDown(event: PointerEvent) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (isInteractiveTarget(event.target)) return;
    activePointer = event.pointerId;
    startX = event.clientX;
    startY = event.clientY;
    dragCommitted = false;
    samples.length = 0;
    pushSample(event.clientX);
  }

  function onPointerMove(event: PointerEvent) {
    if (event.pointerId !== activePointer) return;
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;
    if (!dragCommitted) {
      if (
        Math.abs(dx) < DRAG_THRESHOLD_PX &&
        Math.abs(dy) < DRAG_THRESHOLD_PX
      ) {
        return;
      }
      // On touch, let a clearly vertical gesture through (pinch/system gestures).
      if (event.pointerType === "touch" && Math.abs(dy) > Math.abs(dx) * 1.4) {
        activePointer = -1;
        return;
      }
      dragCommitted = true;
      state.dragging = true;
      anchorX = event.clientX;
      anchorScroll = current;
      root.value?.setPointerCapture(activePointer);
      markInteracted();
    }
    // 1:1 tracking from the commit anchor — content stays glued to the pointer.
    current = anchorScroll - (event.clientX - anchorX);
    target = current;
    pushSample(event.clientX);
  }

  function endDrag(withMomentum: boolean) {
    if (dragCommitted) {
      if (withMomentum && !state.reducedMotion) {
        // Finger moving right (+v) pushes content right → scroll decreases.
        target = current + projectMomentum(-releaseVelocity());
      }
      state.dragging = false;
    }
    dragCommitted = false;
    activePointer = -1;
  }

  function onPointerUp(event: PointerEvent) {
    if (event.pointerId !== activePointer) return;
    pushSample(event.clientX);
    endDrag(true);
  }

  function onPointerCancel(event: PointerEvent) {
    if (event.pointerId !== activePointer) return;
    endDrag(false);
  }

  function onKeyDown(event: KeyboardEvent) {
    if (
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.defaultPrevented
    )
      return;
    if (
      isInteractiveTarget(event.target) &&
      event.target instanceof HTMLElement
    ) {
      const tag = event.target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
    }
    const viewport = window.innerWidth;
    switch (event.key) {
      case "ArrowRight":
        target += viewport * 0.5;
        break;
      case "ArrowLeft":
        target -= viewport * 0.5;
        break;
      case "PageDown":
        target += viewport;
        break;
      case "PageUp":
        target -= viewport;
        break;
      default:
        return;
    }
    event.preventDefault();
    markInteracted();
  }

  function renormalize() {
    if (state.dragging || Math.abs(current) < RENORMALIZE_LIMIT) return;
    const width = state.trackWidth;
    const shift = Math.trunc(current / width) * width;
    current -= shift;
    target -= shift;
  }

  function tick(time: number) {
    rafId = requestAnimationFrame(tick);
    const dt =
      lastTime === 0 ? 0.016 : Math.min(0.05, (time - lastTime) / 1000);
    lastTime = time;

    const previous = current;
    if (!state.dragging) {
      const alpha = state.reducedMotion ? 1 : 1 - Math.exp(-SMOOTH_RATE * dt);
      current += (target - current) * alpha;
      if (Math.abs(target - current) < 0.05) current = target;
    }
    renormalize();

    const instantVelocity = dt > 0 ? (current - previous) / dt : 0;
    state.velocity +=
      (instantVelocity - state.velocity) *
      Math.min(1, VELOCITY_SMOOTH_RATE * dt);

    const width = state.trackWidth;
    state.scroll = current;
    state.wrapped = ((current % width) + width) % width;
    state.progress = state.wrapped / width;
  }

  function startLoop() {
    if (rafId) return;
    lastTime = 0;
    rafId = requestAnimationFrame(tick);
  }

  function stopLoop() {
    if (!rafId) return;
    cancelAnimationFrame(rafId);
    rafId = 0;
  }

  function onVisibilityChange() {
    if (document.hidden) stopLoop();
    else startLoop();
  }

  /** Animate to a track offset via the shortest wrapped path. */
  function scrollToOffset(left: number) {
    const width = state.trackWidth;
    const to = ((left % width) + width) % width;
    let delta = to - state.wrapped;
    delta -= Math.round(delta / width) * width;
    target = current + delta;
    markInteracted();
  }

  let resizeObserver: ResizeObserver | null = null;
  let mediaQuery: MediaQueryList | null = null;

  function onReducedMotionChange(event: MediaQueryListEvent) {
    state.reducedMotion = event.matches;
  }

  onMounted(() => {
    measureTrack();

    mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    state.reducedMotion = mediaQuery.matches;
    mediaQuery.addEventListener("change", onReducedMotionChange);

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", measureTrack);
    document.addEventListener("visibilitychange", onVisibilityChange);

    const rootEl = root.value;
    if (rootEl) {
      rootEl.addEventListener("pointerdown", onPointerDown);
      rootEl.addEventListener("pointermove", onPointerMove);
      rootEl.addEventListener("pointerup", onPointerUp);
      rootEl.addEventListener("pointercancel", onPointerCancel);
    }

    if (measure.value && typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(measureTrack);
      resizeObserver.observe(measure.value);
    }

    startLoop();
  });

  onBeforeUnmount(() => {
    stopLoop();
    mediaQuery?.removeEventListener("change", onReducedMotionChange);
    window.removeEventListener("wheel", onWheel);
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("resize", measureTrack);
    document.removeEventListener("visibilitychange", onVisibilityChange);

    const rootEl = root.value;
    if (rootEl) {
      rootEl.removeEventListener("pointerdown", onPointerDown);
      rootEl.removeEventListener("pointermove", onPointerMove);
      rootEl.removeEventListener("pointerup", onPointerUp);
      rootEl.removeEventListener("pointercancel", onPointerCancel);
    }

    resizeObserver?.disconnect();
    resizeObserver = null;
  });

  return { state, scrollToOffset };
}
