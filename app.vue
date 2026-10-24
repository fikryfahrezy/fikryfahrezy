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
const navLinks = computed(() => [
  { to: { path: homePath.value }, label: t("sections.me.label"), glyph: "星" },
  { to: projectsPath.value, label: t("sections.projects.label"), glyph: "作" },
  { to: animePath.value, label: t("sections.anime.label"), glyph: "ア" },
  { to: musicPath.value, label: t("sections.music.label"), glyph: "音" },
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
      <p class="footer-wordmark" aria-hidden="true">
        <span>Fikry</span><span class="footer-wordmark-star">✦</span><span>Fahrezy</span>
      </p>
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
