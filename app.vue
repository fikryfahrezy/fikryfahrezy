<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { Locale } from "~/types/locale";
import { ThemePreference } from "~/types/theme";

const themeOrder = Object.values(ThemePreference);

const { locale, setLocale, t } = useI18n();
const route = useRoute();
const localePath = useLocalePath();
const switchLocalePath = useSwitchLocalePath();
const alternateLocale = computed(() =>
  locale.value === Locale.English ? Locale.Indonesian : Locale.English,
);
const alternateLocalePath = computed(() =>
  // URL fragments are never sent to the server. Excluding the current hash
  // keeps this SSR-rendered href identical during client hydration.
  switchLocalePath(alternateLocale.value).replace(/#.*/, ""),
);
const savedTheme = useCookie<ThemePreference>("portfolio-theme", {
  default: () => ThemePreference.Dark,
  sameSite: "lax",
});
const themePreference = ref<ThemePreference>(savedTheme.value);
const systemPrefersLight = ref(false);
const useFallbackScan = ref(false);

const isLightTheme = computed(
  () =>
    themePreference.value === ThemePreference.Light ||
    (themePreference.value === ThemePreference.System &&
      systemPrefersLight.value),
);
const nextTheme = computed(
  () =>
    themeOrder[
      (themeOrder.indexOf(themePreference.value) + 1) % themeOrder.length
    ],
);
const themeLabel = computed(() =>
  t(
    `theme.${
      nextTheme.value === ThemePreference.Light
        ? "switchToLight"
        : nextTheme.value === ThemePreference.Dark
          ? "switchToDark"
          : "switchToSystem"
    }`,
  ),
);
const themeName = computed(
  () =>
    themePreference.value.charAt(0).toUpperCase() +
    themePreference.value.slice(1),
);
const homePath = computed(() => localePath("/"));
const projectsPath = computed(() => localePath("/projects"));
const animePath = computed(() => localePath("/anime"));
const musicPath = computed(() => localePath("/music"));
const shoutoutsPath = computed(() => localePath("/shoutouts"));
const navLinks = computed(() => [
  { to: { path: homePath.value }, label: t("sections.me.label"), glyph: "星" },
  { to: projectsPath.value, label: t("sections.projects.label"), glyph: "作" },
  { to: animePath.value, label: t("sections.anime.label"), glyph: "ア" },
  { to: musicPath.value, label: t("sections.music.label"), glyph: "音" },
  {
    to: shoutoutsPath.value,
    label: t("sections.shoutouts.label"),
    glyph: "敬",
  },
]);
const themeIcon = computed(() =>
  themePreference.value === ThemePreference.System
    ? "◐"
    : isLightTheme.value
      ? "☀"
      : "☾",
);

async function switchLocale() {
  await setLocale(alternateLocale.value);
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function handleBrandClick(event: MouseEvent) {
  if (route.path !== homePath.value) return;
  event.preventDefault();
  scrollToTop();
}

function applyTheme() {
  document.documentElement.classList.toggle("theme-light", isLightTheme.value);
}

function updateTheme() {
  themePreference.value = nextTheme.value;
  savedTheme.value = themePreference.value;
  localStorage.setItem("portfolio-theme", themePreference.value);
  applyTheme();
}

async function toggleTheme() {
  const viewTransitionDocument = document as Document & {
    startViewTransition?: (callback: () => void) => { finished: Promise<void> };
  };

  if (viewTransitionDocument.startViewTransition) {
    await viewTransitionDocument.startViewTransition(updateTheme).finished;
    return;
  }

  useFallbackScan.value = true;
  updateTheme();
  await new Promise((resolve) => window.setTimeout(resolve, 620));
  useFallbackScan.value = false;
}

let systemThemeQuery: MediaQueryList | undefined;

function handleSystemThemeChange(event: MediaQueryListEvent) {
  systemPrefersLight.value = event.matches;
  if (themePreference.value === ThemePreference.System) applyTheme();
}

onMounted(() => {
  systemThemeQuery = window.matchMedia("(prefers-color-scheme: light)");
  systemPrefersLight.value = systemThemeQuery.matches;
  systemThemeQuery.addEventListener("change", handleSystemThemeChange);

  const storedTheme = localStorage.getItem("portfolio-theme");
  if (
    storedTheme === ThemePreference.Light ||
    storedTheme === ThemePreference.Dark ||
    storedTheme === ThemePreference.System
  ) {
    themePreference.value = storedTheme;
    savedTheme.value = storedTheme;
  }
  applyTheme();
});

onBeforeUnmount(() => {
  systemThemeQuery?.removeEventListener("change", handleSystemThemeChange);
});

const { data: profile } = await useProfile();

function oneLine(value: string | undefined) {
  return value?.replace(/\s+/g, " ").trim();
}

useHead({
  htmlAttrs: { lang: () => locale.value },
  title: () => oneLine(profile.value?.seoTitle),
  link: [
    { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
    { rel: "icon", type: "image/svg+xml", href: "/favicon.svg", sizes: "any" },
    { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
  ],
  meta: [
    {
      name: "theme-color",
      content: () => (isLightTheme.value ? "#cddee5" : "#00081c"),
    },
  ],
  script: [
    {
      key: "theme-preference",
      tagPosition: "head",
      innerHTML: `try { const stored = localStorage.getItem("portfolio-theme"); const cookie = document.cookie.match(/(?:^|; )portfolio-theme=([^;]*)/)?.[1]; const theme = stored || cookie || ${JSON.stringify(ThemePreference.Dark)}; const isLight = theme === ${JSON.stringify(ThemePreference.Light)} || (theme === ${JSON.stringify(ThemePreference.System)} && window.matchMedia("(prefers-color-scheme: light)").matches); document.documentElement.classList.toggle("theme-light", isLight); } catch {}`,
    },
    {
      key: "umami-analytics",
      tagPosition: "head",
      src: "https://analytics.fahrezy.work/script.js",
      defer: true,
      "data-website-id": "3d1dde60-64ac-4f5d-a4d2-50065883aa33",
    },
  ],
});

useSeoMeta({
  description: () => oneLine(profile.value?.seoDescription),
  ogTitle: () => oneLine(profile.value?.seoTitle),
  ogDescription: () => oneLine(profile.value?.ogDescription),
});
</script>

<template>
  <div class="site-shell" :class="{ 'theme-light': isLightTheme }">
    <NuxtRouteAnnouncer />
    <NuxtLoadingIndicator
      color="var(--comet)"
      :height="3"
      :throttle="0"
    />
    <a class="skip-link" href="#main-content">
      {{ t("navigation.skipToMainContent") }}
    </a>
    <div
      v-if="useFallbackScan"
      class="theme-scan-fallback"
      aria-hidden="true"
    />
    <StarField />
    <div class="scroll-comet" aria-hidden="true">
      <span />
    </div>

    <header class="site-header">
      <NuxtLink
        class="brand-mark"
        :to="homePath"
        :aria-label="t('navigation.backToStart')"
        @click="handleBrandClick"
      >
        <span class="brand-star" aria-hidden="true">✦</span>
        <span class="brand-text">FF<span>/26</span></span>
      </NuxtLink>

      <nav class="site-nav" :aria-label="t('navigation.sections')">
        <NuxtLink v-for="link in navLinks" :key="link.label" :to="link.to">
          <span class="site-nav-glyph" aria-hidden="true">{{ link.glyph }}</span>
          <ScrambleText :text="link.label" />
        </NuxtLink>
      </nav>

      <div class="header-controls">
        <button
          class="theme-switch"
          type="button"
          :aria-label="themeLabel"
          :title="themeLabel"
          :data-theme="themePreference"
          @click="toggleTheme"
        >
          <span class="theme-switch-icon" aria-hidden="true">{{ themeIcon }}</span>
          <span class="theme-switch-label">{{ themeName }}</span>
        </button>

        <a
          class="locale-switch"
          :href="alternateLocalePath"
          :aria-label="
            t('navigation.changeLanguage', {
              language: t(`language.${alternateLocale}`),
            })
          "
          @click.prevent="switchLocale"
        >
          {{ locale.toUpperCase() }}
          <span aria-hidden="true">→</span>
          {{ alternateLocale.toUpperCase() }}
        </a>
      </div>
    </header>

    <main id="main-content" tabindex="-1">
      <NuxtPage :transition="{ name: 'page', mode: 'out-in' }" />
    </main>

    <footer class="site-footer">
      <svg class="footer-comet" viewBox="0 0 1000 180" aria-hidden="true">
        <defs>
          <linearGradient id="footer-comet-tail" x1="0" y1="0" x2="900" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" class="footer-comet-stop-fade" />
            <stop offset="1" class="footer-comet-stop-head" />
          </linearGradient>
          <radialGradient id="footer-comet-glow">
            <stop offset="0" class="footer-comet-stop-glow" />
            <stop offset="1" class="footer-comet-stop-fade" />
          </radialGradient>
        </defs>
        <path class="footer-comet-tail" d="M10 150 L880 80 L880 104 Z" />
        <g class="footer-comet-streaks">
          <path d="M880 92 Q520 110 60 160" />
          <path d="M880 92 Q560 80 180 112" />
          <path d="M880 92 Q620 128 300 172" />
        </g>
        <g class="footer-comet-sparks">
          <circle cx="132" cy="46" r="2" />
          <circle cx="358" cy="28" r="1.5" />
          <circle cx="604" cy="160" r="2" />
          <circle cx="742" cy="38" r="1.5" />
          <circle cx="968" cy="150" r="2" />
        </g>
        <circle class="footer-comet-glow" cx="880" cy="92" r="72" />
        <g transform="translate(880 92)">
          <path
            class="footer-comet-head"
            d="M0 -40 C5 -9 9 -5 40 0 C9 5 5 9 0 40 C-5 9 -9 5 -40 0 C-9 -5 -5 -9 0 -40 Z"
          />
        </g>
      </svg>
      <div class="footer-meta">
        <span>© 2025–2026 FFR</span>
        <span>{{ t("footer.built") }}</span>
        <button v-magnetic type="button" @click="scrollToTop">
          {{ t("navigation.backToStart") }} ↑
        </button>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.skip-link {
  position: fixed;
  z-index: 100;
  top: 12px;
  left: 12px;
  padding: 10px 14px;
  transform: translateY(-160%);
  background: var(--comet);
  color: var(--on-comet);
  font-family: var(--mono);
  font-size: 12px;
  font-weight: 700;
  transition: transform 180ms ease;
}

.skip-link:focus-visible {
  transform: translateY(0);
}

.site-shell {
  position: relative;
  isolation: isolate;
  min-height: 100vh;
  /* Suisei's site sits on a quiet 1px grid; ours drifts under the stars. */
  background-color: var(--paper);
  background-image:
    linear-gradient(var(--grid-line) 1px, transparent 1px),
    linear-gradient(90deg, var(--grid-line) 1px, transparent 1px);
  background-size: 120px 120px;
  background-position: center top;
  color: var(--ink);
}

.site-shell::before {
  position: fixed;
  z-index: -1;
  inset: 0;
  content: "";
  pointer-events: none;
  background:
    radial-gradient(60vw 50vh at 85% 0%, rgb(0 60 255 / 22%), transparent 70%),
    radial-gradient(50vw 50vh at 0% 100%, rgb(0 60 255 / 14%), transparent 70%);
}

.theme-light .site-shell::before {
  background:
    radial-gradient(
      60vw 50vh at 85% 0%,
      rgb(255 255 255 / 55%),
      transparent 70%
    ),
    radial-gradient(
      50vw 60vh at 0% 100%,
      rgb(173 203 215 / 70%),
      transparent 70%
    );
}

main {
  position: relative;
  z-index: 1;
  outline: none;
}

/* ---------- Scroll comet --------------------------------------------------- */

.scroll-comet {
  position: fixed;
  z-index: 30;
  top: calc(var(--header-height) + 24px);
  right: 14px;
  bottom: 24px;
  width: 1px;
  background: var(--line);
  pointer-events: none;
}

.scroll-comet span {
  position: absolute;
  top: calc(var(--scroll-progress, 0) * 100%);
  left: 50%;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  background: var(--comet);
  box-shadow: 0 0 16px 4px rgb(var(--comet-rgb) / 60%);
}

.scroll-comet span::before {
  position: absolute;
  bottom: 50%;
  left: 50%;
  width: 1px;
  height: 64px;
  transform: translateX(-50%);
  background: linear-gradient(to top, var(--comet), transparent);
  content: "";
}

.theme-light .scroll-comet span {
  background: var(--cobalt);
}

.theme-light .scroll-comet span::before {
  background: linear-gradient(to top, var(--cobalt), transparent);
}

/* ---------- Header ------------------------------------------------------- */

.site-header {
  position: sticky;
  z-index: 40;
  top: 0;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 16px;
  height: var(--header-height);
  padding-inline: max(24px, calc((100vw - 1320px) / 2));
  border-bottom: 1px solid var(--line);
}

/* The blur sits on a pseudo-element: a backdrop-filter on the header itself
   would trap the mobile nav dock (position: fixed) inside it. */
.site-header::before {
  position: absolute;
  z-index: -1;
  inset: 0;
  background: var(--header-bg);
  backdrop-filter: blur(14px) saturate(1.4);
  -webkit-backdrop-filter: blur(14px) saturate(1.4);
  content: "";
}

.brand-mark {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  width: fit-content;
  font-family: var(--display);
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.04em;
}

.brand-star {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  background: var(--cobalt);
  color: var(--comet);
  font-size: 16px;
  transition: transform 600ms var(--ease-spring);
}

.brand-mark:hover .brand-star {
  transform: rotate(180deg) scale(1.08);
}

.brand-text span {
  color: var(--muted);
  font-family: var(--mono);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0;
  vertical-align: super;
}

.site-nav {
  display: flex;
  gap: 2px;
  padding: 4px;
  border: 1px solid var(--line);
  background: var(--paper-sunk);
}

.site-nav a {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 38px;
  padding-inline: 16px;
  color: var(--muted);
  font-family: var(--mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  transition:
    color 200ms ease,
    background-color 200ms ease;
}

.site-nav-glyph {
  font-family: var(--jp);
  font-size: 12px;
  opacity: 0.5;
  transition:
    opacity 200ms ease,
    transform 400ms var(--ease-spring);
}

.site-nav a:hover {
  color: var(--ink);
}

.site-nav a:hover .site-nav-glyph {
  opacity: 1;
  transform: rotate(-12deg) scale(1.15);
}

.site-nav a.router-link-exact-active {
  background: var(--cobalt);
  color: var(--on-cobalt);
}

.site-nav a.router-link-exact-active .site-nav-glyph {
  color: var(--comet);
  opacity: 1;
}

.header-controls {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.theme-switch,
.locale-switch {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 38px;
  padding-inline: 14px;
  border: 1px solid var(--line-strong);
  background: transparent;
  color: var(--ink);
  cursor: pointer;
  font-family: var(--mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  transition:
    background-color 200ms ease,
    color 200ms ease,
    border-color 200ms ease;
}

.theme-switch:hover,
.locale-switch:hover {
  border-color: var(--comet);
  background: var(--comet);
  color: var(--on-comet);
}

.theme-light .theme-switch:hover,
.theme-light .locale-switch:hover {
  border-color: var(--cobalt);
  background: var(--cobalt);
  color: var(--on-cobalt);
}

.theme-switch-icon {
  display: inline-block;
  font-size: 14px;
  transition: transform 500ms var(--ease-spring);
}

.theme-switch:hover .theme-switch-icon {
  transform: rotate(200deg);
}

/* ---------- Footer ------------------------------------------------------- */

.site-footer {
  position: relative;
  z-index: 1;
  width: var(--page);
  margin-inline: auto;
  padding-bottom: 28px;
  overflow: hidden;
}

.footer-comet {
  display: block;
  width: 100%;
  height: auto;
  margin-bottom: 18px;
}

.footer-comet-stop-fade {
  stop-color: rgb(var(--tail-rgb) / 0%);
}

.footer-comet-stop-head {
  stop-color: rgb(var(--tail-rgb) / 55%);
}

.footer-comet-stop-glow {
  stop-color: rgb(var(--comet-rgb) / 35%);
}

.footer-comet-tail {
  fill: url(#footer-comet-tail);
}

.footer-comet-streaks path {
  fill: none;
  stroke: url(#footer-comet-tail);
  stroke-width: 1.5px;
  stroke-dasharray: 60 30;
  vector-effect: non-scaling-stroke;
  animation: comet-streak 2.4s linear infinite;
}

.footer-comet-streaks path:nth-child(2) {
  animation-duration: 3.1s;
}

.footer-comet-streaks path:nth-child(3) {
  animation-duration: 2.7s;
}

.footer-comet-sparks circle {
  fill: rgb(var(--star-rgb) / 70%);
  animation: spark-flicker 3s ease-in-out infinite alternate;
}

.footer-comet-sparks circle:nth-child(even) {
  animation-delay: -1.5s;
}

.footer-comet-glow {
  fill: url(#footer-comet-glow);
}

.footer-comet-head {
  fill: var(--comet);
  transform-box: fill-box;
  transform-origin: center;
  animation: spin 12s linear infinite;
}

.theme-light .footer-comet-head {
  fill: var(--cobalt);
}

/* Streak paths start at the head, so a negative offset pushes the dashes
   away from it, out along the tail. */
@keyframes comet-streak {
  to {
    stroke-dashoffset: -90;
  }
}

@keyframes spark-flicker {
  from {
    opacity: 0.25;
  }

  to {
    opacity: 1;
  }
}

.footer-meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 12px 24px;
  padding-top: 18px;
  border-top: 1px solid var(--line-strong);
  color: var(--muted);
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.footer-meta button {
  border: 0;
  padding: 0;
  background: transparent;
  color: var(--ink);
  cursor: pointer;
  font: inherit;
  letter-spacing: inherit;
  text-transform: inherit;
}

.theme-scan-fallback {
  position: fixed;
  z-index: 100;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    transparent 44%,
    var(--comet) 50%,
    transparent 56%,
    transparent 100%
  );
  animation: scan-down 620ms cubic-bezier(0.65, 0, 0.35, 1) both;
}

@keyframes scan-down {
  from {
    transform: translateY(-100%);
  }

  to {
    transform: translateY(100%);
  }
}

@media (max-width: 800px) {
  .site-header {
    grid-template-columns: 1fr auto;
    padding-inline: 16px;
  }

  /* The nav becomes a floating dock along the bottom edge. */
  .site-nav {
    position: fixed;
    z-index: 45;
    bottom: max(14px, env(safe-area-inset-bottom));
    left: 50%;
    transform: translateX(-50%);
    border-color: var(--line-strong);
    background: var(--header-bg);
    backdrop-filter: blur(14px) saturate(1.4);
    -webkit-backdrop-filter: blur(14px) saturate(1.4);
    box-shadow: var(--shadow);
  }

  .site-nav a {
    flex-direction: column;
    gap: 2px;
    min-height: 48px;
    padding-inline: 14px;
    font-size: 9.5px;
  }

  .site-nav-glyph {
    font-size: 14px;
    opacity: 0.8;
  }

  .theme-switch-label {
    display: none;
  }

  .scroll-comet {
    display: none;
  }

  .site-footer {
    padding-bottom: 100px;
  }
}
</style>
