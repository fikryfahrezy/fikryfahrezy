<script setup lang="ts">
const { data: skills } = await useSkills();
const { t } = useI18n();
</script>

<template>
  <section
    data-section="skills"
    class="relative flex h-full w-max shrink-0 items-center px-[8vw] pb-28 pt-20 md:w-screen"
  >
    <div class="md:w-full md:max-w-4xl">
      <p class="hud-eyebrow mb-8">{{ t("sections.skills.eyebrow") }}</p>
      <div class="flex gap-4 md:grid md:grid-cols-2">
        <div
          v-for="group in skills"
          :key="group.id"
          class="glass-panel w-64 shrink-0 p-5 md:w-auto md:p-6"
          :class="group.wide ? 'md:col-span-2' : ''"
        >
          <h3
            class="font-display text-xs uppercase tracking-[0.18em] text-comet-cyan/80"
          >
            {{ group.group }}
          </h3>
          <ul class="mt-3 flex flex-wrap gap-2">
            <li v-for="item in group.items" :key="item" class="chip">{{ item }}</li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>
