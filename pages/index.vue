<script setup lang="ts">
import { computed, onMounted, ref } from "vue";

const { locale, setLocale, t } = useI18n();
const switchLocalePath = useSwitchLocalePath();
const alternateLocale = computed(() => (locale.value === "en" ? "id" : "en"));
const alternateLocalePath = computed(() =>
  // URL fragments are never sent to the server. Excluding the current hash
  // keeps this SSR-rendered href identical during client hydration.
  switchLocalePath(alternateLocale.value).replace(/#.*/, ""),
);
const savedTheme = useCookie<"dark" | "light">("portfolio-theme", {
  default: () => "dark",
  sameSite: "lax",
});
const isLightTheme = ref(savedTheme.value === "light");
const useFallbackScan = ref(false);

const themeLabel = computed(() =>
  isLightTheme.value ? t("theme.switchToDark") : t("theme.switchToLight"),
);

async function switchLocale() {
  await setLocale(alternateLocale.value);
}

function updateTheme() {
  isLightTheme.value = !isLightTheme.value;
  savedTheme.value = isLightTheme.value ? "light" : "dark";
  document.documentElement.classList.toggle("theme-light", isLightTheme.value);
  localStorage.setItem(
    "portfolio-theme",
    isLightTheme.value ? "light" : "dark",
  );
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

onMounted(() => {
  const storedTheme = localStorage.getItem("portfolio-theme");
  if (storedTheme === "light" || storedTheme === "dark") {
    isLightTheme.value = storedTheme === "light";
    savedTheme.value = storedTheme;
    document.documentElement.classList.toggle(
      "theme-light",
      isLightTheme.value,
    );
  }
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
        'try { document.documentElement.classList.toggle("theme-light", localStorage.getItem("portfolio-theme") === "light"); } catch {}',
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
    <div
      v-if="useFallbackScan"
      class="theme-scan-fallback"
      aria-hidden="true"
    />
    <GraphicBackground />

    <header class="site-header">
      <a class="brand-mark" href="#top" :aria-label="t('navigation.backToStart')">
        FF<span>/26</span>
      </a>

      <nav class="site-nav" :aria-label="t('navigation.sections')">
        <a href="#now">{{ t("sections.now.label") }}</a>
        <a href="#journey">{{ t("sections.journey.label") }}</a>
        <a href="#skills">{{ t("sections.skills.label") }}</a>
        <a href="#education">{{ t("sections.education.label") }}</a>
        <a href="#contact">{{ t("sections.contact.label") }}</a>
      </nav>

      <div class="header-controls">
        <button
          class="theme-switch"
          type="button"
          :aria-label="themeLabel"
          :title="themeLabel"
          @click="toggleTheme"
        >
          <span aria-hidden="true">{{ isLightTheme ? "◐" : "◑" }}</span>
          <span class="theme-switch-label">{{ isLightTheme ? "Light" : "Dark" }}</span>
        </button>

        <a
          class="locale-switch"
          :href="alternateLocalePath"
          @click.prevent="switchLocale"
          :aria-label="
            t('navigation.changeLanguage', {
              language: t(`language.${alternateLocale}`),
            })
          "
        >
          {{ locale.toUpperCase() }}
          <span aria-hidden="true">→</span>
          {{ alternateLocale.toUpperCase() }}
        </a>
      </div>
    </header>

    <main>
      <HeroSection />
      <NowSection />
      <JourneySection />
      <SkillsSection />
      <EducationSection />
      <ContactSection />
    </main>

    <footer class="site-footer">
      <span>© {{ new Date().getFullYear() }} FFR</span>
      <span>{{ t("footer.built") }}</span>
      <a href="#top">{{ t("navigation.backToStart") }} ↑</a>
    </footer>
  </div>
</template>
