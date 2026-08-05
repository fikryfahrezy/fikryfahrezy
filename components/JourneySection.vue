<script setup lang="ts">
const { data: journey } = await useJourney();
const { data: sections } = await useSections();
</script>

<template>
  <section
    data-section="journey"
    class="relative flex h-full w-max shrink-0 items-center px-[12vw] pb-28 pt-20"
  >
    <div>
      <p class="hud-eyebrow mb-8">{{ sections?.journey.eyebrow }}</p>
      <div class="relative flex items-start gap-8 md:gap-12">
        <div
          class="absolute -inset-x-16 top-[5px] h-px bg-gradient-to-r from-transparent via-comet-cyan/35 to-transparent"
          aria-hidden="true"
        />
        <article
          v-for="(stop, i) in journey"
          :key="stop.id"
          class="relative w-72 shrink-0 md:w-80"
        >
          <span
            class="star-node absolute left-8 top-[5px] -translate-x-1/2 -translate-y-1/2"
            aria-hidden="true"
          />
          <span
            class="absolute left-8 top-[5px] w-px bg-gradient-to-b from-comet-cyan/40 to-comet-cyan/5"
            :class="i % 2 ? 'h-24' : 'h-12'"
            aria-hidden="true"
          />
          <div class="glass-panel p-6" :class="i % 2 ? 'mt-24' : 'mt-12'">
            <p
              class="font-display text-[11px] uppercase tracking-[0.2em] text-comet-cyan/70"
            >
              {{ (i + 1).toString().padStart(2, "0") }} · {{ stop.period }}
            </p>
            <h3 class="mt-2 font-display text-xl font-600 text-star">
              {{ stop.company }}
            </h3>
            <p class="text-sm text-star-dim">{{ stop.role }} · {{ stop.location }}</p>
            <ContentRenderer
              :value="stop"
              class="prose-copy mt-3 text-sm text-star-dim text-pretty"
            />
            <p v-if="stop.clients" class="mt-3 text-xs leading-relaxed text-comet-gold/90">
              {{ stop.clients.join(" · ") }}
            </p>
            <ul class="mt-4 flex flex-wrap gap-1.5">
              <li v-for="tag in stop.tags" :key="tag" class="chip chip-sm">
                {{ tag }}
              </li>
            </ul>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
