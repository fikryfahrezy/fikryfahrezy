<script setup lang="ts">
import { computed } from "vue";

const { locale, setLocale, t } = useI18n();
const switchLocalePath = useSwitchLocalePath();
const alternateLocale = computed(() => (locale.value === "en" ? "id" : "en"));
const alternateLocalePath = computed(() =>
  switchLocalePath(alternateLocale.value),
);

async function switchLocale() {
  await setLocale(alternateLocale.value);
}

const { data: profile } = await useProfile();

function oneLine(value: string | undefined) {
  return value?.replace(/\s+/g, " ").trim();
}

useHead({
  htmlAttrs: { lang: () => locale.value },
  title: () => oneLine(profile.value?.seoTitle),
  meta: [{ name: "theme-color", content: "#050505" }],
});

useSeoMeta({
  description: () => oneLine(profile.value?.seoDescription),
  ogTitle: () => oneLine(profile.value?.seoTitle),
  ogDescription: () => oneLine(profile.value?.ogDescription),
});
</script>

<template>
  <div class="site-shell">
    <NuxtRouteAnnouncer />
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
