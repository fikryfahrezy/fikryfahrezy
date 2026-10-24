import { defineConfig, presetWind3 } from "unocss";

// Palette lifted from Hoshimachi Suisei's official site: cobalt blocks on an
// ice-blue field, deep-sea navy, and a single comet-yellow highlight. The
// runtime theme lives in assets/css/main.css as CSS variables; these mirror
// it for utility classes.
export default defineConfig({
  presets: [presetWind3()],
  theme: {
    colors: {
      cobalt: { DEFAULT: "#003cff", soft: "#5a7dff" },
      ice: { DEFAULT: "#cddee5", mist: "#adcbd7", frost: "#ddecf1" },
      abyss: { DEFAULT: "#000f30", deep: "#00081c" },
      comet: "#f5ff14",
    },
    fontFamily: {
      display: "'Bricolage Grotesque', 'Inter', system-ui, sans-serif",
      sans: "'Inter', system-ui, sans-serif",
      mono: "'JetBrains Mono', ui-monospace, monospace",
    },
  },
});
