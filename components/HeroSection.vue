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

<style scoped>
.hero {
  position: relative;
  padding-block: clamp(40px, 6vw, 80px) clamp(64px, 8vw, 110px);
}

.hero-topline {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 12px 24px;
  margin-bottom: clamp(20px, 3vw, 36px);
}

.hero-topline .section-kicker span:not(.kicker-plus) {
  color: var(--line-strong);
}

.hero-clock {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--muted);
  font-family: var(--mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.hero-clock time {
  color: var(--ink);
  font-variant-numeric: tabular-nums;
}

.hero-clock-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--comet);
  box-shadow: 0 0 10px var(--comet);
  animation: pulse 2s ease-in-out infinite;
}

.theme-light .hero-clock-dot {
  background: var(--cobalt);
  box-shadow: 0 0 10px var(--cobalt);
}

.hero-name {
  display: grid;
  margin-bottom: clamp(28px, 4vw, 52px);
  font-family: var(--display);
  font-size: clamp(56px, 11.6vw, 184px);
  font-weight: 800;
  letter-spacing: -0.055em;
  line-height: 0.86;
}

.hero-line {
  display: flex;
  flex-wrap: wrap;
  column-gap: 0.22em;
}

.hero-line-trail {
  align-items: flex-start;
  justify-self: end;
  color: transparent;
  -webkit-text-stroke: 1.5px var(--ink);
}

.hero-word {
  display: inline-flex;
  white-space: nowrap;
}

.hero-letter {
  display: inline-block;
  animation: letter-rise 900ms var(--ease-out) backwards;
  animation-delay: calc(var(--i) * 32ms + 120ms);
  transition:
    transform 450ms var(--ease-spring),
    color 200ms ease;
  cursor: default;
}

.hero-letter:hover {
  transform: translateY(-0.1em) rotate(-7deg);
  color: var(--comet);
  -webkit-text-stroke-color: var(--comet);
  transition-duration: 160ms;
}

.theme-light .hero-letter:hover {
  color: var(--cobalt);
  -webkit-text-stroke-color: var(--cobalt);
}

.hero-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(280px, 1fr);
  gap: clamp(20px, 3vw, 40px);
  align-items: stretch;
}

.hero-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 28px;
  padding: clamp(24px, 3.4vw, 44px);
  overflow: hidden;
  background: var(--panel);
  color: var(--panel-ink);
  box-shadow: var(--shadow);
}

.hero-intro {
  max-width: 62ch;
  font-size: clamp(17px, 1.45vw, 21px);
  line-height: 1.6;
}

.hero-intro :deep(strong) {
  font-weight: 600;
  text-decoration: underline 2px var(--comet);
  text-underline-offset: 5px;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: auto;
}

.hero-side {
  position: relative;
  display: grid;
  grid-template-rows: 1fr auto auto;
  justify-items: center;
  gap: 18px;
}

.hero-badge-hint {
  color: var(--muted);
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.hero-facts {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  width: 100%;
  margin: 0;
  border: 1px solid var(--line-strong);
}

.hero-facts div {
  display: flex;
  flex-direction: column-reverse;
  justify-content: flex-end;
  gap: 8px;
  padding: 16px;
  background: var(--paper-raised);
  transition:
    background-color 250ms ease,
    color 250ms ease;
}

.hero-facts div + div {
  border-left: 1px solid var(--line-strong);
}

.hero-facts div:hover {
  background: var(--comet);
  color: var(--on-comet);
}

.hero-facts div:hover dt {
  color: var(--on-comet);
}

.hero-facts dd {
  margin: 0;
  font-family: var(--display);
  font-size: clamp(30px, 3vw, 44px);
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1;
}

.hero-facts dt {
  color: var(--muted);
  font-family: var(--mono);
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.1em;
  line-height: 1.45;
  text-transform: uppercase;
}

.hero-vertical {
  position: absolute;
  top: clamp(90px, 12vw, 180px);
  right: -28px;
  color: var(--accent);
  font-family: var(--jp);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.5em;
  opacity: 0.7;
  writing-mode: vertical-rl;
}

.hero-coordinate {
  margin-top: 28px;
  color: var(--muted);
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

@media (max-width: 1080px) {
  .hero-grid {
    grid-template-columns: 1fr;
  }

  .hero-side {
    grid-template-columns: auto 1fr;
    grid-template-rows: auto auto;
    align-items: center;
    justify-items: stretch;
  }

  .hero-badge-hint {
    grid-column: 1;
    grid-row: 2;
    justify-self: center;
  }

  .hero-facts {
    grid-column: 2;
    grid-row: 1 / span 2;
  }
}

@media (max-width: 800px) {
  .hero-line-trail {
    justify-self: start;
  }

  .hero-vertical {
    display: none;
  }

  .hero-side {
    grid-template-columns: 1fr;
    justify-items: center;
  }

  .hero-badge-hint,
  .hero-facts {
    grid-column: 1;
    grid-row: auto;
  }

  .hero-facts dt {
    font-size: 8.5px;
  }
}
</style>
