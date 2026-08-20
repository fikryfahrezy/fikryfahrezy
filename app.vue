<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

type ThemePreference = "light" | "dark" | "system";

const themeOrder: ThemePreference[] = ["light", "dark", "system"];

const { locale, setLocale, t } = useI18n();
const route = useRoute();
const localePath = useLocalePath();
const switchLocalePath = useSwitchLocalePath();
const alternateLocale = computed(() => (locale.value === "en" ? "id" : "en"));
const alternateLocalePath = computed(() =>
  // URL fragments are never sent to the server. Excluding the current hash
  // keeps this SSR-rendered href identical during client hydration.
  switchLocalePath(alternateLocale.value).replace(/#.*/, ""),
);
const savedTheme = useCookie<ThemePreference>("portfolio-theme", {
  default: () => "dark",
  sameSite: "lax",
});
const themePreference = ref<ThemePreference>(savedTheme.value);
const systemPrefersLight = ref(false);
const useFallbackScan = ref(false);

const isLightTheme = computed(
  () =>
    themePreference.value === "light" ||
    (themePreference.value === "system" && systemPrefersLight.value),
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
      nextTheme.value === "light"
        ? "switchToLight"
        : nextTheme.value === "dark"
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
  if (themePreference.value === "system") applyTheme();
}

onMounted(() => {
  systemThemeQuery = window.matchMedia("(prefers-color-scheme: light)");
  systemPrefersLight.value = systemThemeQuery.matches;
  systemThemeQuery.addEventListener("change", handleSystemThemeChange);

  const storedTheme = localStorage.getItem("portfolio-theme");
  if (
    storedTheme === "light" ||
    storedTheme === "dark" ||
    storedTheme === "system"
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
  meta: [
    {
      name: "theme-color",
      content: () => (isLightTheme.value ? "#f5f5f0" : "#070707"),
    },
  ],
  script: [
    {
      key: "theme-preference",
      tagPosition: "head",
      innerHTML:
        'try { const stored = localStorage.getItem("portfolio-theme"); const cookie = document.cookie.match(/(?:^|; )portfolio-theme=([^;]*)/)?.[1]; const theme = stored || cookie || "dark"; const isLight = theme === "light" || (theme === "system" && window.matchMedia("(prefers-color-scheme: light)").matches); document.documentElement.classList.toggle("theme-light", isLight); } catch {}',
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
    <a class="skip-link" href="#main-content">
      {{ t("navigation.skipToMainContent") }}
    </a>
    <div
      v-if="useFallbackScan"
      class="theme-scan-fallback"
      aria-hidden="true"
    />
    <GraphicBackground />

    <header class="site-header">
      <NuxtLink
        class="brand-mark"
        :to="homePath"
        :aria-label="t('navigation.backToStart')"
        @click="handleBrandClick"
      >
        FF<span>/26</span>
      </NuxtLink>

      <nav class="site-nav" :aria-label="t('navigation.sections')">
        <NuxtLink :to="{ path: homePath, hash: '#now' }">
          {{ t("sections.now.label") }}
        </NuxtLink>
        <NuxtLink :to="{ path: homePath, hash: '#journey' }">
          {{ t("sections.journey.label") }}
        </NuxtLink>
        <NuxtLink :to="{ path: homePath, hash: '#skills' }">
          {{ t("sections.skills.label") }}
        </NuxtLink>
        <NuxtLink :to="{ path: homePath, hash: '#contact' }">
          {{ t("sections.contact.label") }}
        </NuxtLink>
        <NuxtLink :to="projectsPath">{{ t("sections.projects.label") }}</NuxtLink>
        <NuxtLink :to="animePath">{{ t("sections.anime.label") }}</NuxtLink>
      </nav>

      <nav class="mobile-page-links" :aria-label="t('navigation.pages')">
        <NuxtLink :to="projectsPath">{{ t("sections.projects.label") }}</NuxtLink>
        <NuxtLink :to="animePath">{{ t("sections.anime.label") }}</NuxtLink>
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
          <span aria-hidden="true">{{ isLightTheme ? "◐" : "◑" }}</span>
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
      <span>© 2025–2026 FFR</span>
      <span>{{ t("footer.built") }}</span>
      <button type="button" @click="scrollToTop">
        {{ t("navigation.backToStart") }} ↑
      </button>
    </footer>
  </div>
</template>
