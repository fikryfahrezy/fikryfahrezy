import { defineConfig, presetWind3 } from "unocss";

export default defineConfig({
  presets: [presetWind3()],
  theme: {
    colors: {
      space: {
        DEFAULT: "#04060f",
        900: "#070b1c",
        800: "#0c1330",
        700: "#131c42",
      },
      star: {
        DEFAULT: "#dbe7ff",
        dim: "#93a5cf",
      },
      comet: {
        cyan: "#7cd5ff",
        blue: "#5f8bff",
        gold: "#f6c66d",
      },
    },
    fontFamily: {
      display: "'Space Grotesk', 'Outfit', system-ui, sans-serif",
      sans: "'Outfit', system-ui, sans-serif",
    },
  },
  shortcuts: {
    "hud-eyebrow":
      "font-display text-xs md:text-sm uppercase tracking-[0.35em] text-comet-cyan/80",
    "glass-panel":
      "rounded-2xl border border-star/10 bg-space-900/55 backdrop-blur-md shadow-[0_0_0_1px_rgba(148,190,255,0.06),0_24px_48px_-24px_rgba(2,6,23,0.9)]",
    chip: "rounded-full border border-comet-cyan/20 bg-comet-cyan/8 px-3 py-1 text-xs text-star-dim md:text-sm",
    "chip-sm": "px-2.5 py-0.5 text-[11px]",
    "hud-link":
      "relative inline-flex min-h-10 items-center px-3 text-sm text-star-dim transition-colors duration-200 hover:text-comet-cyan",
    "star-node":
      "block h-2.5 w-2.5 rotate-45 bg-comet-gold shadow-[0_0_14px_3px_rgba(246,198,109,0.5)]",
    "contact-link":
      "inline-flex min-h-10 items-center gap-2 rounded-full border border-star/12 bg-space-900/50 px-5 text-sm text-star transition-[color,border-color,transform] duration-200 hover:border-comet-cyan/50 hover:text-comet-cyan active:scale-[0.96]",
  },
});
