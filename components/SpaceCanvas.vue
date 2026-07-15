<script setup lang="ts">
import * as THREE from "three";
import { onBeforeUnmount, onMounted, ref } from "vue";
import type { LoopScrollState } from "~/composables/useLoopScroll";

const props = defineProps<{
  view: LoopScrollState;
}>();

const canvasEl = ref<HTMLCanvasElement | null>(null);
const failed = ref(false);

const CAMERA_Z = 100;
const FOV = 60;
// Section nebula tints, in track order: hero, now, journey, skills, contact.
const TINTS_A = ["#22346e", "#3b2d72", "#123f5e", "#173f52", "#5c4020"];
const TINTS_B = ["#6fb5e8", "#8f7bd8", "#4fc9d8", "#63cfae", "#e8b662"];

type StarLayer = {
  points: THREE.Points;
  material: THREE.ShaderMaterial;
  geometry: THREE.BufferGeometry;
  parallax: number;
  span: number;
};

const STAR_VERTEX = /* glsl */ `
  attribute float aSeed;
  attribute float aScale;
  attribute float aHue;
  uniform float uOffset;
  uniform float uSpan;
  uniform float uTime;
  uniform float uPixelRatio;
  varying float vTwinkle;
  varying float vHue;

  void main() {
    vec3 p = position;
    p.x = mod(p.x - uOffset, uSpan) - uSpan * 0.5;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float twinkle = 0.72 + 0.28 * sin(uTime * (0.5 + aSeed * 1.9) + aSeed * 43.0);
    vTwinkle = twinkle;
    vHue = aHue;
    gl_PointSize = aScale * uPixelRatio * (120.0 / -mv.z) * (0.8 + 0.35 * twinkle);
    gl_Position = projectionMatrix * mv;
  }
`;

const STAR_FRAGMENT = /* glsl */ `
  uniform float uBoost;
  varying float vTwinkle;
  varying float vHue;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    float core = smoothstep(0.5, 0.0, d);
    core = pow(core, 2.4);
    vec3 white = vec3(0.92, 0.95, 1.0);
    vec3 cyan = vec3(0.55, 0.85, 1.0);
    vec3 gold = vec3(1.0, 0.82, 0.5);
    vec3 color = mix(white, cyan, clamp(vHue, 0.0, 1.0));
    color = mix(color, gold, clamp(vHue - 1.0, 0.0, 1.0));
    float alpha = core * vTwinkle * (0.85 + uBoost);
    gl_FragColor = vec4(color, alpha);
  }
`;

const BACKGROUND_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 1.0, 1.0);
  }
`;

const BACKGROUND_FRAGMENT = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uDrift;
  uniform vec2 uRes;
  uniform vec3 uTintA;
  uniform vec3 uTintB;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 4; i++) {
      value += amp * noise(p);
      p *= 2.03;
      amp *= 0.55;
    }
    return value;
  }

  void main() {
    vec2 uv = vUv;
    vec2 p = vec2(uv.x * uRes.x / uRes.y, uv.y);
    vec3 color = mix(
      vec3(0.010, 0.014, 0.042),
      vec3(0.032, 0.046, 0.095),
      pow(1.0 - uv.y, 1.7)
    );
    float drift = uDrift + uTime * 0.004;
    float n1 = fbm(p * 1.5 + vec2(drift * 2.0, 0.35));
    float n2 = fbm(p * 2.7 + vec2(-drift * 3.1, 1.7) + n1 * 0.55);
    color += uTintA * smoothstep(0.42, 0.88, n1) * 0.20;
    color += uTintB * smoothstep(0.55, 0.97, n2) * 0.13;
    float vignette = smoothstep(1.25, 0.35, length(uv - 0.5));
    color *= mix(0.72, 1.0, vignette);
    color += (hash(uv * uRes + fract(uTime) * 61.7) - 0.5) * 0.012;
    gl_FragColor = vec4(color, 1.0);
  }
`;

const COMET_VERTEX = /* glsl */ `
  attribute float aTrail;
  uniform float uPixelRatio;
  uniform float uFade;
  varying float vTrail;
  varying float vFade;

  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vTrail = aTrail;
    vFade = uFade;
    float size = mix(30.0, 3.0, aTrail);
    gl_PointSize = size * uPixelRatio * (120.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const COMET_FRAGMENT = /* glsl */ `
  varying float vTrail;
  varying float vFade;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float core = smoothstep(0.5, 0.0, length(uv));
    core = pow(core, 2.0);
    vec3 head = vec3(1.0, 0.93, 0.75);
    vec3 tail = vec3(0.45, 0.75, 1.0);
    vec3 color = mix(head, tail, vTrail);
    float alpha = core * pow(1.0 - vTrail, 1.8) * vFade;
    gl_FragColor = vec4(color, alpha);
  }
`;

function frustumHeightAt(distance: number): number {
  return 2 * distance * Math.tan((FOV * Math.PI) / 360);
}

onMounted(() => {
  const canvas = canvasEl.value;
  if (!canvas) return;

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: false,
      powerPreference: "high-performance",
    });
  } catch {
    failed.value = true;
    return;
  }

  const pixelRatio = () => Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(pixelRatio());
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    FOV,
    window.innerWidth / window.innerHeight,
    0.1,
    500,
  );
  camera.position.z = CAMERA_Z;

  const disposables: Array<{ dispose: () => void }> = [];

  // --- Background nebula (fullscreen quad) ---
  const backgroundUniforms = {
    uTime: { value: 0 },
    uDrift: { value: 0 },
    uRes: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    uTintA: { value: new THREE.Color(TINTS_A[0]) },
    uTintB: { value: new THREE.Color(TINTS_B[0]) },
  };
  const backgroundGeometry = new THREE.PlaneGeometry(2, 2);
  const backgroundMaterial = new THREE.ShaderMaterial({
    vertexShader: BACKGROUND_VERTEX,
    fragmentShader: BACKGROUND_FRAGMENT,
    uniforms: backgroundUniforms,
    depthTest: false,
    depthWrite: false,
  });
  const backgroundMesh = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
  backgroundMesh.frustumCulled = false;
  backgroundMesh.renderOrder = -1;
  scene.add(backgroundMesh);
  disposables.push(backgroundGeometry, backgroundMaterial);

  // --- Star layers ---
  const layerConfigs = [
    { z: -90, count: 900, scale: 1.5, parallax: 0.16, spanFactor: 3 },
    { z: -30, count: 420, scale: 2.4, parallax: 0.38, spanFactor: 3 },
    { z: 30, count: 170, scale: 3.6, parallax: 0.75, spanFactor: 3 },
  ];

  const starLayers: StarLayer[] = layerConfigs.map((config) => {
    const distance = CAMERA_Z - config.z;
    const height = frustumHeightAt(distance);
    const aspect = Math.max(window.innerWidth / window.innerHeight, 1.2);
    const span = height * aspect * config.spanFactor;

    const positions = new Float32Array(config.count * 3);
    const seeds = new Float32Array(config.count);
    const scales = new Float32Array(config.count);
    const hues = new Float32Array(config.count);
    for (let i = 0; i < config.count; i++) {
      positions[i * 3] = Math.random() * span;
      positions[i * 3 + 1] = (Math.random() - 0.5) * height * 1.25;
      positions[i * 3 + 2] = config.z;
      seeds[i] = Math.random();
      scales[i] = config.scale * (0.55 + Math.random() * 0.9);
      const roll = Math.random();
      // ~70% white, ~22% cyan, ~8% gold sparkles.
      hues[i] =
        roll < 0.7
          ? Math.random() * 0.25
          : roll < 0.92
            ? 0.7 + Math.random() * 0.3
            : 1.75 + Math.random() * 0.25;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    geometry.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));
    geometry.setAttribute("aHue", new THREE.BufferAttribute(hues, 1));

    const material = new THREE.ShaderMaterial({
      vertexShader: STAR_VERTEX,
      fragmentShader: STAR_FRAGMENT,
      uniforms: {
        uOffset: { value: 0 },
        uSpan: { value: span },
        uTime: { value: 0 },
        uPixelRatio: { value: pixelRatio() },
        uBoost: { value: 0 },
      },
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const points = new THREE.Points(geometry, material);
    points.frustumCulled = false;
    scene.add(points);
    disposables.push(geometry, material);

    return { points, material, geometry, parallax: config.parallax, span };
  });

  // --- Comet ---
  const COMET_COUNT = 72;
  const COMET_PERIOD = 26;
  const COMET_TRAVEL = 8;
  const cometPositions = new Float32Array(COMET_COUNT * 3);
  const cometTrail = new Float32Array(COMET_COUNT);
  for (let i = 0; i < COMET_COUNT; i++) {
    cometTrail[i] = i / (COMET_COUNT - 1);
  }
  const cometGeometry = new THREE.BufferGeometry();
  const cometPositionAttr = new THREE.BufferAttribute(cometPositions, 3);
  cometPositionAttr.setUsage(THREE.DynamicDrawUsage);
  cometGeometry.setAttribute("position", cometPositionAttr);
  cometGeometry.setAttribute(
    "aTrail",
    new THREE.BufferAttribute(cometTrail, 1),
  );
  const cometMaterial = new THREE.ShaderMaterial({
    vertexShader: COMET_VERTEX,
    fragmentShader: COMET_FRAGMENT,
    uniforms: {
      uPixelRatio: { value: pixelRatio() },
      uFade: { value: 0 },
    },
    transparent: true,
    depthTest: false,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const cometPoints = new THREE.Points(cometGeometry, cometMaterial);
  cometPoints.frustumCulled = false;
  cometPoints.renderOrder = 1;
  scene.add(cometPoints);
  disposables.push(cometGeometry, cometMaterial);

  function hash01(n: number): number {
    const x = Math.sin(n * 127.1) * 43758.5453;
    return x - Math.floor(x);
  }

  const cometPoint = (t: number, cycle: number, out: THREE.Vector3) => {
    const distance = CAMERA_Z - 20;
    const height = frustumHeightAt(distance);
    const width = height * camera.aspect;
    const seedA = hash01(cycle + 1);
    const seedB = hash01(cycle + 17);
    const x0 = width * 0.65;
    const x1 = -width * 0.65;
    const y0 = height * (0.05 + seedA * 0.38);
    const y1 = y0 - height * (0.35 + seedB * 0.3);
    out.set(
      x0 + (x1 - x0) * t,
      y0 + (y1 - y0) * t + Math.sin(t * Math.PI) * height * 0.04,
      20,
    );
  };

  const scratch = new THREE.Vector3();

  // --- Per-frame state ---
  const paletteA = TINTS_A.map((hex) => new THREE.Color(hex));
  const paletteB = TINTS_B.map((hex) => new THREE.Color(hex));
  const tintA = paletteA[0].clone();
  const tintB = paletteB[0].clone();
  const tintTargetA = new THREE.Color();
  const tintTargetB = new THREE.Color();
  let boost = 0;
  let worldPerPx = 1;
  let lastFrameMs = 0;
  // Drift accumulates incrementally so a resize (which changes worldPerPx)
  // never retroactively rescales the whole scroll history and teleports stars.
  let driftWorld = 0;
  let prevScrollPx = props.view.scroll;

  function updateWorldScale() {
    worldPerPx =
      (frustumHeightAt(CAMERA_Z) * camera.aspect) / window.innerWidth;
  }
  updateWorldScale();

  function render(timeMs: number) {
    const reduced = props.view.reducedMotion;
    const time = reduced ? 40 : timeMs / 1000;
    const dt =
      lastFrameMs === 0
        ? 1 / 60
        : Math.min(0.05, (timeMs - lastFrameMs) / 1000);
    lastFrameMs = timeMs;
    driftWorld += (props.view.scroll - prevScrollPx) * worldPerPx;
    prevScrollPx = props.view.scroll;

    // Section tint crossfade, wrapping at the loop seam.
    const count = paletteA.length;
    const t = props.view.progress * count;
    const index = ((Math.floor(t) % count) + count) % count;
    const next = (index + 1) % count;
    const f = t - Math.floor(t);
    const eased = f * f * (3 - 2 * f);
    tintTargetA.copy(paletteA[index]).lerp(paletteA[next], eased);
    tintTargetB.copy(paletteB[index]).lerp(paletteB[next], eased);
    const tintAlpha = 1 - Math.exp(-5 * dt);
    tintA.lerp(tintTargetA, tintAlpha);
    tintB.lerp(tintTargetB, tintAlpha);
    backgroundUniforms.uTintA.value.copy(tintA);
    backgroundUniforms.uTintB.value.copy(tintB);
    backgroundUniforms.uTime.value = time;
    backgroundUniforms.uDrift.value = (driftWorld * 0.0022) % 1024;

    // Velocity → brightness boost + subtle camera roll.
    const targetBoost = reduced
      ? 0
      : Math.min(0.5, Math.abs(props.view.velocity) / 5000);
    boost += (targetBoost - boost) * (1 - Math.exp(-3.7 * dt));
    const targetRoll = reduced
      ? 0
      : THREE.MathUtils.clamp(-props.view.velocity * 6e-6, -0.016, 0.016);
    camera.rotation.z +=
      (targetRoll - camera.rotation.z) * (1 - Math.exp(-3 * dt));

    for (const layer of starLayers) {
      const offset =
        (((driftWorld * layer.parallax) % layer.span) + layer.span) %
        layer.span;
      layer.material.uniforms.uOffset.value = offset;
      layer.material.uniforms.uTime.value = time;
      layer.material.uniforms.uBoost.value = boost;
    }

    // Comet flight.
    if (reduced) {
      cometMaterial.uniforms.uFade.value = 0;
    } else {
      const elapsed = timeMs / 1000;
      const cycle = Math.floor(elapsed / COMET_PERIOD);
      const local = elapsed % COMET_PERIOD;
      const s = local / COMET_TRAVEL;
      if (s <= 1.1) {
        const fade =
          THREE.MathUtils.smoothstep(s, 0, 0.1) *
          (1 - THREE.MathUtils.smoothstep(s, 0.82, 1.05));
        cometMaterial.uniforms.uFade.value = fade;
        for (let i = 0; i < COMET_COUNT; i++) {
          const ti = Math.max(0, s - i * 0.0045);
          cometPoint(ti, cycle, scratch);
          cometPositions[i * 3] = scratch.x;
          cometPositions[i * 3 + 1] = scratch.y;
          cometPositions[i * 3 + 2] = scratch.z;
        }
        cometPositionAttr.needsUpdate = true;
      } else {
        cometMaterial.uniforms.uFade.value = 0;
      }
    }

    renderer.render(scene, camera);
  }

  renderer.setAnimationLoop(render);

  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(pixelRatio());
    renderer.setSize(window.innerWidth, window.innerHeight);
    backgroundUniforms.uRes.value.set(window.innerWidth, window.innerHeight);
    updateWorldScale();
    const ratio = pixelRatio();
    for (const layer of starLayers) {
      layer.material.uniforms.uPixelRatio.value = ratio;
    }
    cometMaterial.uniforms.uPixelRatio.value = ratio;
  }
  window.addEventListener("resize", onResize);

  function onVisibilityChange() {
    renderer.setAnimationLoop(document.hidden ? null : render);
  }
  document.addEventListener("visibilitychange", onVisibilityChange);

  function onContextLost(event: Event) {
    event.preventDefault();
    renderer.setAnimationLoop(null);
  }
  function onContextRestored() {
    renderer.setAnimationLoop(render);
  }
  canvas.addEventListener("webglcontextlost", onContextLost);
  canvas.addEventListener("webglcontextrestored", onContextRestored);

  onBeforeUnmount(() => {
    renderer.setAnimationLoop(null);
    window.removeEventListener("resize", onResize);
    document.removeEventListener("visibilitychange", onVisibilityChange);
    canvas.removeEventListener("webglcontextlost", onContextLost);
    canvas.removeEventListener("webglcontextrestored", onContextRestored);
    for (const disposable of disposables) disposable.dispose();
    renderer.dispose();
  });
});
</script>

<template>
  <canvas
    v-show="!failed"
    ref="canvasEl"
    class="absolute inset-0 h-full w-full"
    aria-hidden="true"
  />
</template>
