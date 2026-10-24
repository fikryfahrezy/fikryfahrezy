<script setup lang="ts">
const { data: profile } = await useProfile();
const { t } = useI18n();

// Each word is split into letters so they can be lifted one at a time on
// hover; words stay intact so the name never breaks mid-word.
const splitName = (value: string | undefined) =>
  (value ?? "").split(" ").map((word) => [...word]);

const leadWords = computed(() => splitName(profile.value?.nameLead));
const trailWords = computed(() => splitName(profile.value?.nameTrail));
const fullName = computed(
  () => `${profile.value?.nameLead ?? ""} ${profile.value?.nameTrail ?? ""}`,
);
const ring = computed(() =>
  [profile.value?.role, profile.value?.location].filter(Boolean).join(" ✦ "),
);

// Rendered as a placeholder on the server and ticking once mounted, so SSR
// and hydration agree.
const localTime = ref("--:--:--");
let clock: ReturnType<typeof setInterval> | undefined;

onMounted(() => {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "Asia/Jakarta",
  });
  const update = () => {
    localTime.value = formatter.format(new Date());
  };
  update();
  clock = setInterval(update, 1000);
});

onBeforeUnmount(() => clearInterval(clock));
</script>

<template>
  <section id="top" class="hero section-wrap">
    <div class="hero-topline">
      <p class="section-kicker">
        <span class="kicker-plus" aria-hidden="true">+</span>
        {{ profile?.role }} <span>/</span> {{ profile?.location }}
      </p>
      <p class="hero-clock">
        <span class="hero-clock-dot" aria-hidden="true" />
        {{ t("hero.localTime") }}
        <time>{{ localTime }}</time>
        <span>UTC+07</span>
      </p>
    </div>

    <h1 class="hero-name">
      <span class="sr-only">{{ fullName }}</span>
      <span class="hero-line" aria-hidden="true">
        <span v-for="(word, w) in leadWords" :key="w" class="hero-word">
          <span
            v-for="(letter, l) in word"
            :key="l"
            class="hero-letter"
            :style="{ '--i': w * 7 + l }"
          >{{ letter }}</span>
        </span>
      </span>
      <span class="hero-line hero-line-trail" aria-hidden="true">
        <span v-for="(word, w) in trailWords" :key="w" class="hero-word">
          <span
            v-for="(letter, l) in word"
            :key="l"
            class="hero-letter"
            :style="{ '--i': 14 + w * 7 + l }"
          >{{ letter }}</span>
        </span>
        <span class="hero-star" aria-hidden="true">✦</span>
      </span>
    </h1>

    <div class="hero-grid">
      <div v-tilt="{ max: 3 }" class="hero-panel">
        <p class="panel-label">
          <span aria-hidden="true">+</span> {{ t("hero.about") }}
        </p>
        <ContentRenderer v-if="profile" :value="profile" class="hero-intro" />
        <div class="hero-actions">
          <a v-magnetic class="button button-comet" :href="`mailto:${profile?.email}`">
            {{ t("hero.startConversation") }} <span aria-hidden="true">↗</span>
          </a>
          <a
            v-magnetic
            class="button"
            href="/fikry-fahrezy-ramadhan-resume.pdf"
            target="_blank"
            rel="noreferrer"
          >
            {{ t("hero.downloadResume") }} <span aria-hidden="true">↓</span>
          </a>
          <a v-magnetic class="button button-ghost" :href="profile?.github" target="_blank" rel="noreferrer">
            GitHub <span aria-hidden="true">↗</span>
          </a>
          <a v-magnetic class="button button-ghost" :href="profile?.linkedin" target="_blank" rel="noreferrer">
            LinkedIn <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>

      <div class="hero-side">
        <CometBadge :ring="ring" :label="t('hero.starfall')" />
        <p class="hero-badge-hint" aria-hidden="true">{{ t("hero.starfallHint") }}</p>

        <dl class="hero-facts" :aria-label="t('hero.quickFacts')">
          <div>
            <dt>{{ t("hero.years") }}</dt>
            <dd>{{ profile?.yearsExperience }}</dd>
          </div>
          <div>
            <dt>{{ t("hero.remote") }}</dt>
            <dd>∞</dd>
          </div>
          <div>
            <dt>{{ t("hero.based") }}</dt>
            <dd>ID</dd>
          </div>
        </dl>
      </div>
    </div>

    <p class="hero-vertical" aria-hidden="true">彗星のごとく</p>
    <p class="hero-coordinate" aria-hidden="true">
      {{ profile?.backgroundCoordinate }} · {{ profile?.backgroundTimezone }}
    </p>
  </section>
</template>
