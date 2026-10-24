<script setup lang="ts">
// One fixed canvas behind every page:
//   • a parallax starfield that drifts with scroll and twinkles,
//   • constellation lines that connect stars near the pointer,
//   • a comet tail that follows the pointer (fine pointers only),
//   • a spray of sparks on click, and
//   • shooting stars — occasional, or a full shower when anything on the
//     page dispatches a `starfall` event on window.
// Colours come from CSS variables, so it follows the light/dark theme.

type Star = { x: number; y: number; z: number; r: number; phase: number };
type Spark = { x: number; y: number; vx: number; vy: number; life: number };
type Meteor = { x: number; y: number; vx: number; vy: number; life: number };
type TrailPoint = { x: number; y: number; life: number };

const canvas = ref<HTMLCanvasElement | null>(null);

onMounted(() => {
  const surface = canvas.value;
  const context = surface?.getContext("2d");
  if (!surface || !context) return;
  // Re-bound so the hoisted helpers below see the narrowed, non-null types.
  const el = surface;
  const ctx = context;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const root = document.documentElement;

  let width = 0;
  let height = 0;
  let stars: Star[] = [];
  let sparks: Spark[] = [];
  let meteors: Meteor[] = [];
  let trail: TrailPoint[] = [];
  let pointer = { x: -9999, y: -9999, active: false };
  let palette = { star: "230 240 245", comet: "245 255 20", tail: "0 60 255" };
  let frame = 0;
  let lastMeteor = performance.now();
  let nextMeteorIn = 3000;

  function readPalette() {
    const styles = getComputedStyle(root);
    palette = {
      star: styles.getPropertyValue("--star-rgb").trim() || palette.star,
      comet: styles.getPropertyValue("--comet-rgb").trim() || palette.comet,
      tail: styles.getPropertyValue("--tail-rgb").trim() || palette.tail,
    };
  }

  function seedStars() {
    const count = Math.round(
      Math.min(340, Math.max(90, (width * height) / 5200)),
    );
    stars = Array.from({ length: count }, () => {
      const z = 0.15 + Math.random() ** 2 * 0.85;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        z,
        r: 0.4 + z * 1.5,
        phase: Math.random() * Math.PI * 2,
      };
    });
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    el.width = width * dpr;
    el.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seedStars();
    if (reduceMotion.matches) draw(performance.now());
  }

  function spawnMeteor(fromX?: number) {
    const angle = Math.PI * (0.18 + Math.random() * 0.12);
    const speed = 9 + Math.random() * 7;
    meteors.push({
      x: fromX ?? Math.random() * width * 1.1,
      y: -40 - Math.random() * height * 0.25,
      vx: -Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
    });
  }

  function onStarfall() {
    if (reduceMotion.matches) return;
    for (let i = 0; i < 18; i++) {
      window.setTimeout(
        () => spawnMeteor(width * (0.25 + Math.random() * 0.95)),
        i * 90 + Math.random() * 120,
      );
    }
  }

  function onPointerMove(event: PointerEvent) {
    if (event.pointerType !== "mouse") return;
    pointer = { x: event.clientX, y: event.clientY, active: true };
    trail.push({ x: event.clientX, y: event.clientY, life: 1 });
    if (trail.length > 28) trail.shift();
  }

  function onPointerLeave() {
    pointer.active = false;
  }

  function onPointerDown(event: PointerEvent) {
    if (reduceMotion.matches) return;
    for (let i = 0; i < 14; i++) {
      const angle = (i / 14) * Math.PI * 2 + Math.random() * 0.4;
      const speed = 1.5 + Math.random() * 3.5;
      sparks.push({
        x: event.clientX,
        y: event.clientY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
      });
    }
  }

  function drawStar(x: number, y: number, r: number, alpha: number) {
    ctx.fillStyle = `rgb(${palette.star} / ${alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    // The brightest stars get a four-point glint, like the ✦ in the logo.
    if (r > 1.6 && alpha > 0.7) {
      ctx.strokeStyle = `rgb(${palette.star} / ${alpha * 0.35})`;
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.moveTo(x - r * 3.2, y);
      ctx.lineTo(x + r * 3.2, y);
      ctx.moveTo(x, y - r * 3.2);
      ctx.lineTo(x, y + r * 3.2);
      ctx.stroke();
    }
  }

  function draw(now: number) {
    ctx.clearRect(0, 0, width, height);
    const scroll = window.scrollY;
    const t = now / 1000;
    const near: { x: number; y: number; d: number }[] = [];

    for (const star of stars) {
      const y =
        (((star.y - scroll * star.z * 0.35) % height) + height) % height;
      const twinkle = reduceMotion.matches
        ? 0.7
        : 0.45 + Math.sin(t * (0.6 + star.z * 1.6) + star.phase) * 0.35;
      const alpha = Math.max(0.08, twinkle * (0.35 + star.z * 0.65));
      drawStar(star.x, y, star.r, alpha);

      if (pointer.active) {
        const d = Math.hypot(star.x - pointer.x, y - pointer.y);
        if (d < 170) near.push({ x: star.x, y, d });
      }
    }

    // Constellation: the pointer becomes a star that links its neighbours.
    if (near.length) {
      near.sort((a, b) => a.d - b.d);
      const links = near.slice(0, 7);
      ctx.lineWidth = 0.8;
      for (let i = 0; i < links.length; i++) {
        const a = links[i];
        ctx.strokeStyle = `rgb(${palette.star} / ${(1 - a.d / 170) * 0.55})`;
        ctx.beginPath();
        ctx.moveTo(pointer.x, pointer.y);
        ctx.lineTo(a.x, a.y);
        ctx.stroke();
        const b = links[i + 1];
        if (b) {
          ctx.strokeStyle = `rgb(${palette.star} / 0.16)`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    // Comet tail behind the pointer.
    if (finePointer && trail.length > 1) {
      for (let i = 1; i < trail.length; i++) {
        const p = trail[i];
        const prev = trail[i - 1];
        const k = i / trail.length;
        ctx.strokeStyle = `rgb(${palette.tail} / ${k * p.life * 0.7})`;
        ctx.lineWidth = k * 5;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(prev.x, prev.y);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }
      for (const p of trail) p.life -= 0.045;
      trail = trail.filter((p) => p.life > 0);
    }

    if (finePointer && pointer.active) {
      const glow = ctx.createRadialGradient(
        pointer.x,
        pointer.y,
        0,
        pointer.x,
        pointer.y,
        18,
      );
      glow.addColorStop(0, `rgb(${palette.comet} / 0.95)`);
      glow.addColorStop(0.3, `rgb(${palette.comet} / 0.35)`);
      glow.addColorStop(1, `rgb(${palette.comet} / 0)`);
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(pointer.x, pointer.y, 18, 0, Math.PI * 2);
      ctx.fill();
    }

    for (const s of sparks) {
      s.x += s.vx;
      s.y += s.vy;
      s.vx *= 0.94;
      s.vy *= 0.94;
      s.life -= 0.025;
      drawStar(s.x, s.y, 1.6 * s.life + 0.4, s.life);
      ctx.fillStyle = `rgb(${palette.comet} / ${s.life * 0.8})`;
      ctx.fillRect(s.x - 0.75, s.y - 0.75, 1.5, 1.5);
    }
    sparks = sparks.filter((s) => s.life > 0);

    if (!reduceMotion.matches && now - lastMeteor > nextMeteorIn) {
      spawnMeteor();
      lastMeteor = now;
      nextMeteorIn = 4500 + Math.random() * 7000;
    }

    for (const m of meteors) {
      m.x += m.vx;
      m.y += m.vy;
      if (m.y > height * 0.55) m.life -= 0.03;
      const tail = ctx.createLinearGradient(
        m.x,
        m.y,
        m.x - m.vx * 14,
        m.y - m.vy * 14,
      );
      tail.addColorStop(0, `rgb(${palette.comet} / ${m.life})`);
      tail.addColorStop(0.25, `rgb(${palette.star} / ${m.life * 0.6})`);
      tail.addColorStop(1, `rgb(${palette.tail} / 0)`);
      ctx.strokeStyle = tail;
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(m.x - m.vx * 14, m.y - m.vy * 14);
      ctx.stroke();
    }
    meteors = meteors.filter(
      (m) => m.life > 0 && m.x > -300 && m.y < height + 300,
    );
  }

  function loop(now: number) {
    draw(now);
    frame = requestAnimationFrame(loop);
  }

  function start() {
    cancelAnimationFrame(frame);
    if (reduceMotion.matches || document.hidden) {
      draw(performance.now());
      return;
    }
    frame = requestAnimationFrame(loop);
  }

  const themeObserver = new MutationObserver(() => {
    readPalette();
    if (reduceMotion.matches) draw(performance.now());
  });
  themeObserver.observe(root, { attributes: true, attributeFilter: ["class"] });

  const onScroll = () => {
    if (reduceMotion.matches) draw(performance.now());
  };

  readPalette();
  resize();
  start();

  window.addEventListener("resize", resize);
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("pointerdown", onPointerDown, { passive: true });
  document.documentElement.addEventListener("pointerleave", onPointerLeave);
  window.addEventListener("starfall", onStarfall);
  document.addEventListener("visibilitychange", start);
  reduceMotion.addEventListener("change", start);

  onBeforeUnmount(() => {
    cancelAnimationFrame(frame);
    themeObserver.disconnect();
    window.removeEventListener("resize", resize);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerdown", onPointerDown);
    document.documentElement.removeEventListener(
      "pointerleave",
      onPointerLeave,
    );
    window.removeEventListener("starfall", onStarfall);
    document.removeEventListener("visibilitychange", start);
    reduceMotion.removeEventListener("change", start);
  });
});
</script>

<template>
  <canvas ref="canvas" class="star-field" aria-hidden="true" />
</template>
