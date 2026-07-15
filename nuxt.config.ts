// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
  devtools: { enabled: true },
  nitro: {
    preset: "bun",
  },
  modules: [
    "@nuxt/fonts",
    "@nuxt/image",
    "@nuxt/scripts",
    "@nuxt/test-utils",
    "@unocss/nuxt",
  ],
  css: ["@unocss/reset/tailwind.css", "~/assets/css/main.css"],
  fonts: {
    families: [
      { name: "Space Grotesk", provider: "google", weights: [500, 600, 700] },
      { name: "Outfit", provider: "google", weights: [300, 400, 500, 600] },
    ],
  },
});
