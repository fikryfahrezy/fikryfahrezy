<script setup lang="ts">
const { data: now } = await useNow();
const { t } = useI18n();
</script>

<template>
  <section
    data-section="now"
    class="relative flex h-full w-screen shrink-0 items-center px-[8vw] pb-28 pt-20"
  >
    <div class="w-full max-w-2xl">
      <p class="hud-eyebrow mb-6">{{ t("sections.now.eyebrow") }}</p>
      <div class="glass-panel p-6 md:p-9">
        <div class="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h2 class="font-display text-2xl font-600 text-star md:text-3xl">
            {{ now?.company }}
          </h2>
          <p class="text-sm text-comet-gold">{{ now?.period }}</p>
        </div>
        <p class="mt-1 text-sm text-star-dim">{{ now?.role }} · {{ now?.location }}</p>
        <ContentRenderer
          v-if="now"
          :value="now"
          class="prose-points mt-6 text-sm text-star-dim md:text-base"
        />
        <ul class="mt-7 flex flex-wrap gap-2">
          <li v-for="tag in now?.tags" :key="tag" class="chip">{{ tag }}</li>
        </ul>
      </div>
    </div>
  </section>
</template>
