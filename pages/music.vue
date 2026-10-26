<script setup lang="ts">
const { locale, t } = useI18n();

const { data: musicResponse, error, status } = await useMusic();

const currentTrack = computed(
  () =>
    musicResponse.value.recentTracks.find((track) => track.nowPlaying) || null,
);
const recentTracks = computed(() =>
  musicResponse.value.recentTracks
    .filter((track) => !track.nowPlaying)
    .slice(0, 8),
);
const featuredTrack = computed(
  () => currentTrack.value || recentTracks.value[0] || null,
);
// A printed record label for tracks that have no artwork.
const labelInitials = computed(() =>
  (featuredTrack.value?.name || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => Array.from(word)[0])
    .join("")
    .toUpperCase(),
);
const labelCurveText = computed(() => {
  if (!featuredTrack.value) return "";
  const text = `${featuredTrack.value.name} • ${featuredTrack.value.artist} • `;
  return text.length > 44 ? `${text.slice(0, 41).trimEnd()}… • ` : text;
});
const hasMusic = computed(
  () =>
    musicResponse.value.recentTracks.length > 0 ||
    musicResponse.value.topTracks.length > 0 ||
    musicResponse.value.topArtists.length > 0,
);

const numberFormatter = computed(() => new Intl.NumberFormat(locale.value));
const dateFormatter = computed(
  () =>
    new Intl.DateTimeFormat(locale.value, {
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      month: "short",
    }),
);

const formatNumber = (value: number) => numberFormatter.value.format(value);
const formatDate = (value: string) =>
  dateFormatter.value.format(new Date(value));

const stats = computed(() => [
  {
    label: t("music.totalScrobbles"),
    value: musicResponse.value.stats.scrobbles,
  },
  {
    label: t("music.uniqueArtists"),
    value: musicResponse.value.stats.artists,
  },
  {
    label: t("music.uniqueTracks"),
    value: musicResponse.value.stats.tracks,
  },
]);

useHead({
  title: () => t("music.seoTitle"),
});

useSeoMeta({
  description: () => t("music.description"),
  ogTitle: () => t("music.seoTitle"),
  ogDescription: () => t("music.description"),
});
</script>

<template>
  <div class="showcase-page section-wrap">
    <PageHeader
      index="04"
      :kicker="t('music.eyebrow')"
      :title="`${t('music.titleLead')} ${t('music.titleTrail')}`"
      glyph="音楽"
    >
      <p>{{ t("music.description") }}</p>
        <p>
          <a
            v-if="musicResponse.profileUrl"
            :href="musicResponse.profileUrl"
            target="_blank"
            rel="noreferrer"
          >
            {{ t("music.source") }} <span aria-hidden="true">↗</span>
          </a>
          <span v-else>{{ t("music.source") }}</span>
        </p>
    </PageHeader>

    <section
      v-if="status === 'pending' && !hasMusic"
      class="showcase-placeholder"
      :aria-label="t('music.loading')"
      aria-live="polite"
    >
      <p class="showcase-placeholder-index" aria-hidden="true">·· / ··</p>
      <div>
        <p class="meta-label">{{ t("music.loading") }}</p>
        <h2>{{ t("music.loadingTitle") }}</h2>
      </div>
      <span class="showcase-placeholder-mark" aria-hidden="true">↘</span>
    </section>

    <section
      v-else-if="error && !hasMusic"
      class="showcase-placeholder"
      :aria-label="t('music.errorLabel')"
    >
      <p class="showcase-placeholder-index" aria-hidden="true">ERR / FM</p>
      <div>
        <p class="meta-label">{{ t("music.errorLabel") }}</p>
        <h2>{{ t("music.errorTitle") }}</h2>
        <p>{{ t("music.errorCopy") }}</p>
      </div>
      <span class="showcase-placeholder-mark" aria-hidden="true">↘</span>
    </section>

    <section
      v-else-if="!hasMusic"
      class="showcase-placeholder"
      :aria-label="t('music.emptyLabel')"
    >
      <p class="showcase-placeholder-index" aria-hidden="true">00 / 00</p>
      <div>
        <p class="meta-label">{{ t("music.emptyLabel") }}</p>
        <h2>{{ t("music.emptyTitle") }}</h2>
        <p>{{ t("music.emptyCopy") }}</p>
      </div>
      <span class="showcase-placeholder-mark" aria-hidden="true">↘</span>
    </section>

    <div v-else class="music-dashboard">
      <section
        v-if="featuredTrack"
        v-tilt="{ max: 2 }"
        class="music-now"
        :class="{ 'is-playing': currentTrack }"
        aria-live="polite"
      >
        <div class="music-now-copy">
          <p class="meta-label">
            <span aria-hidden="true">{{ currentTrack ? "●" : "↙" }}</span>
            {{ t(currentTrack ? "music.nowPlaying" : "music.lastPlayed") }}
          </p>
          <h2>
            <a :href="featuredTrack.url" target="_blank" rel="noreferrer">
              {{ featuredTrack.name }}
            </a>
          </h2>
          <p class="music-now-artist">{{ featuredTrack.artist }}</p>
          <p v-if="featuredTrack.album" class="music-now-album">
            {{ featuredTrack.album }}
          </p>
          <time
            v-if="!currentTrack && featuredTrack.playedAt"
            class="music-now-time"
            :datetime="featuredTrack.playedAt"
          >
            {{ formatDate(featuredTrack.playedAt) }}
          </time>
        </div>
        <a
          class="music-now-deck"
          :href="featuredTrack.url"
          target="_blank"
          rel="noreferrer"
          :aria-label="`${featuredTrack.name} — Last.fm`"
        >
          <span class="music-now-record" aria-hidden="true">
            <span class="music-now-disc">
              <img
                v-if="featuredTrack.image"
                class="music-now-label"
                :src="featuredTrack.image"
                alt=""
                width="300"
                height="300"
              />
              <svg
                v-else
                class="music-now-label is-printed"
                viewBox="0 0 100 100"
              >
                <defs>
                  <path
                    id="music-label-curve"
                    d="M 50 50 m -40 0 a 40 40 0 1 1 80 0 a 40 40 0 1 1 -80 0"
                  />
                </defs>
                <circle cx="50" cy="50" r="50" />
                <text class="music-label-curve">
                  <textPath href="#music-label-curve">
                    {{ labelCurveText }}
                  </textPath>
                </text>
                <text class="music-label-initials" x="50" y="38">
                  {{ labelInitials }}
                </text>
                <text class="music-label-side" x="50" y="71">SIDE A</text>
              </svg>
            </span>
          </span>
          <span class="music-now-sleeve">
            <img
              v-if="featuredTrack.image"
              :src="featuredTrack.image"
              :alt="`${featuredTrack.name} artwork`"
              width="300"
              height="300"
            />
            <span v-else aria-hidden="true">
              <strong>{{ labelInitials }}</strong>
              <small>{{ featuredTrack.artist }}</small>
            </span>
          </span>
          <svg class="music-now-tonearm" viewBox="0 0 40 160" aria-hidden="true">
            <line x1="20" y1="14" x2="20" y2="132" />
            <rect class="music-tonearm-head" x="14" y="128" width="12" height="22" rx="2" />
            <circle class="music-tonearm-base" cx="20" cy="14" r="12" />
            <circle class="music-tonearm-pivot" cx="20" cy="14" r="4" />
          </svg>
        </a>
      </section>

      <section class="music-stats" :aria-label="t('music.listeningStats')">
        <article
          v-for="(stat, index) in stats"
          :key="stat.label"
          v-reveal="index * 80"
          v-tilt
        >
          <p class="music-stat-index" aria-hidden="true">
            {{ String(index + 1).padStart(2, "0") }}
          </p>
          <strong>{{ formatNumber(stat.value) }}</strong>
          <p>{{ stat.label }}</p>
        </article>
      </section>

      <section
        v-if="musicResponse.topTracks.length || musicResponse.topArtists.length"
        class="music-charts"
      >
        <div v-reveal class="music-chart">
          <header>
            <p class="meta-label">{{ t("music.overall") }}</p>
            <h2>{{ t("music.topTracks") }}</h2>
          </header>
          <ol>
            <li
              v-for="(track, index) in musicResponse.topTracks"
              :key="`${track.artist}-${track.name}`"
            >
              <span aria-hidden="true">
                {{ String(index + 1).padStart(2, "0") }}
              </span>
              <div>
                <h3>
                  <a :href="track.url" target="_blank" rel="noreferrer">
                    {{ track.name }}
                  </a>
                </h3>
                <p>{{ track.artist }}</p>
              </div>
              <strong>{{ t("music.playCount", track.playCount) }}</strong>
            </li>
          </ol>
        </div>

        <div v-reveal="100" class="music-chart">
          <header>
            <p class="meta-label">{{ t("music.overall") }}</p>
            <h2>{{ t("music.topArtists") }}</h2>
          </header>
          <ol>
            <li
              v-for="(artist, index) in musicResponse.topArtists"
              :key="artist.name"
            >
              <span aria-hidden="true">
                {{ String(index + 1).padStart(2, "0") }}
              </span>
              <div>
                <h3>
                  <a :href="artist.url" target="_blank" rel="noreferrer">
                    {{ artist.name }}
                  </a>
                </h3>
              </div>
              <strong>{{ t("music.playCount", artist.playCount) }}</strong>
            </li>
          </ol>
        </div>
      </section>

      <section v-if="recentTracks.length" class="music-section">
        <header v-reveal class="music-section-heading">
          <p class="music-section-index" aria-hidden="true">01</p>
          <div>
            <p class="meta-label">{{ t("music.latestSignal") }}</p>
            <h2>{{ t("music.recentTracks") }}</h2>
          </div>
          <p>{{ t("music.recentCount", recentTracks.length) }}</p>
        </header>

        <ol class="music-recent-list">
          <li
            v-for="(track, index) in recentTracks"
            :key="`${track.url}-${index}`"
          >
            <span class="music-track-rank" aria-hidden="true">
              {{ String(index + 1).padStart(2, "0") }}
            </span>
            <a
              class="music-track-art"
              :href="track.url"
              target="_blank"
              rel="noreferrer"
              tabindex="-1"
              aria-hidden="true"
            >
              <img
                v-if="track.image"
                :src="track.image"
                alt=""
                loading="lazy"
                width="72"
                height="72"
              />
              <span v-else>♪</span>
            </a>
            <div class="music-track-title">
              <h3>
                <a :href="track.url" target="_blank" rel="noreferrer">
                  {{ track.name }}
                </a>
              </h3>
              <p>{{ track.artist }}</p>
            </div>
            <p class="music-track-album">{{ track.album || "—" }}</p>
            <time v-if="track.playedAt" :datetime="track.playedAt">
              {{ formatDate(track.playedAt) }}
            </time>
          </li>
        </ol>
      </section>

    </div>
  </div>
</template>

<style scoped>
.music-section-heading {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px 24px;
  padding-bottom: 18px;
  border-bottom: 1px solid var(--line-strong);
}

.music-section-heading h2 {
  font-family: var(--display);
  font-size: clamp(34px, 4.6vw, 64px);
  font-weight: 800;
  letter-spacing: -0.045em;
  line-height: 0.95;
}

.music-section-heading > p {
  color: var(--muted);
  font-family: var(--mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.music-dashboard {
  display: grid;
  gap: clamp(28px, 4vw, 48px);
}

.music-now {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: clamp(24px, 4vw, 64px);
  align-items: center;
  padding: clamp(24px, 4vw, 56px);
  overflow: hidden;
  background: var(--cobalt);
  color: var(--on-cobalt);
  box-shadow: var(--shadow);
}

.music-now-copy {
  display: grid;
  gap: 12px;
}

.music-now-copy .meta-label {
  color: var(--comet);
}

.music-now.is-playing .music-now-copy .meta-label span {
  animation: pulse 1.2s ease-in-out infinite;
}

.music-now h2 {
  font-family: var(--display);
  font-size: clamp(38px, 5.6vw, 84px);
  font-weight: 800;
  letter-spacing: -0.05em;
  line-height: 0.92;
}

.music-now-artist {
  font-size: clamp(18px, 1.8vw, 24px);
  font-weight: 600;
}

.music-now-album,
.music-now-time {
  color: var(--panel-muted);
  font-family: var(--mono);
  font-size: 12px;
}

/* The record slides out of its sleeve and the tonearm drops while something plays. */
.music-now-deck {
  --deck: clamp(180px, 22vw, 300px);
  position: relative;
  display: block;
  width: calc(var(--deck) * 1.5);
  height: var(--deck);
}

.music-now-sleeve,
.music-now-record {
  position: absolute;
  top: 0;
  left: 0;
  width: var(--deck);
  height: var(--deck);
}

.music-now-sleeve {
  z-index: 2;
  overflow: hidden;
  background: var(--on-comet);
  box-shadow: 0 20px 50px -20px rgb(0 0 0 / 80%);
}

.music-now-sleeve img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.music-now-sleeve > span {
  display: grid;
  align-content: space-between;
  height: 100%;
  padding: 10%;
  background: repeating-radial-gradient(
    circle at 100% 50%,
    transparent 0 10px,
    rgb(245 255 20 / 10%) 10px 11px
  );
  color: var(--comet);
}

.music-now-sleeve strong {
  font-family: var(--display);
  font-size: calc(var(--deck) * 0.36);
  font-weight: 800;
  letter-spacing: -0.06em;
  line-height: 0.9;
}

.music-now-sleeve small {
  overflow: hidden;
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.14em;
  text-overflow: ellipsis;
  text-transform: uppercase;
  white-space: nowrap;
}

.music-now-record {
  z-index: 1;
  transform: translateX(28%);
  transition: transform 700ms var(--ease-spring);
}

.music-now-disc {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: repeating-radial-gradient(circle, #050505 0 2px, #161616 2px 3px);
  animation: spin 9s linear infinite paused;
}

.music-now-label {
  width: 62%;
  height: 62%;
  border-radius: 50%;
  object-fit: cover;
  -webkit-mask: radial-gradient(circle, transparent 0 9%, black 9.5%);
  mask: radial-gradient(circle, transparent 0 9%, black 9.5%);
}

.music-now-label.is-printed circle {
  fill: var(--comet);
}

.music-now-label.is-printed text {
  fill: var(--on-comet);
  font-family: var(--mono);
  font-weight: 700;
}

.music-label-curve {
  font-size: 7px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.music-label-initials {
  font-family: var(--display);
  font-size: 17px;
  letter-spacing: -0.04em;
  text-anchor: middle;
}

.music-label-side {
  font-size: 5px;
  letter-spacing: 0.3em;
  text-anchor: middle;
}

/* Pivot sits at (20, 14) of the 40×160 viewBox. */
.music-now-tonearm {
  position: absolute;
  z-index: 3;
  top: calc(var(--deck) * -0.015);
  left: calc(var(--deck) * 1.3125);
  width: calc(var(--deck) * 0.215);
  height: calc(var(--deck) * 0.86);
  overflow: visible;
  transform-origin: 50% 8.75%;
  transition: transform 700ms var(--ease-spring);
  filter: drop-shadow(0 6px 8px rgb(0 0 0 / 45%));
}

.music-now-tonearm line {
  stroke: #d9dde3;
  stroke-linecap: round;
  stroke-width: 3;
}

.music-tonearm-head {
  fill: var(--comet);
}

.music-tonearm-base {
  fill: #161616;
  stroke: #d9dde3;
  stroke-width: 1.5;
}

.music-tonearm-pivot {
  fill: #d9dde3;
}

.music-now.is-playing .music-now-record,
.music-now-deck:hover .music-now-record,
.music-now-deck:focus-visible .music-now-record {
  transform: translateX(44%);
}

.music-now.is-playing .music-now-disc,
.music-now-deck:hover .music-now-disc,
.music-now-deck:focus-visible .music-now-disc {
  animation-play-state: running;
}

.music-now.is-playing .music-now-tonearm,
.music-now-deck:hover .music-now-tonearm,
.music-now-deck:focus-visible .music-now-tonearm {
  transform: rotate(20deg);
}

.music-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: clamp(12px, 1.6vw, 20px);
}

.music-stats article {
  position: relative;
  display: grid;
  gap: 10px;
  padding: 24px;
  overflow: hidden;
  border: 1px solid var(--line-strong);
  background: var(--paper-raised);
}

.music-stats article:nth-child(2) {
  border-color: var(--comet);
  background: var(--comet);
  color: var(--on-comet);
}

.music-stats article:nth-child(2) p {
  color: var(--on-comet);
}

.music-stat-index {
  color: var(--accent);
  font-family: var(--mono);
  font-size: 11px;
  font-weight: 700;
}

.music-stats strong {
  font-family: var(--display);
  font-size: clamp(38px, 4.6vw, 68px);
  font-weight: 800;
  letter-spacing: -0.05em;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.music-stats p:last-child {
  color: var(--muted);
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.music-charts {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(16px, 2.4vw, 32px);
}

.music-chart header {
  display: grid;
  gap: 8px;
  margin-bottom: 14px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--line-strong);
}

.music-chart h2 {
  font-family: var(--display);
  font-size: clamp(30px, 3.4vw, 46px);
  font-weight: 800;
  letter-spacing: -0.045em;
}

.music-chart ol,
.music-recent-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.music-chart li {
  position: relative;
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr) auto;
  gap: 14px;
  align-items: center;
  padding: 12px 10px;
  border-bottom: 1px solid var(--line);
  isolation: isolate;
  transition: color 250ms ease;
}

.music-chart li::before,
.music-recent-list li::before {
  position: absolute;
  z-index: -1;
  inset: 0;
  background: var(--cobalt);
  content: "";
  transform: scaleY(0);
  transform-origin: bottom;
  transition: transform 380ms var(--ease-out);
}

.music-chart li:hover,
.music-recent-list li:hover {
  color: var(--on-cobalt);
}

.music-chart li:hover::before,
.music-recent-list li:hover::before {
  transform: scaleY(1);
}

.music-chart li:hover p,
.music-chart li:hover > span,
.music-recent-list li:hover p,
.music-recent-list li:hover time,
.music-recent-list li:hover .music-track-rank {
  color: var(--panel-muted);
}

.music-chart li > span,
.music-track-rank {
  color: var(--accent);
  font-family: var(--mono);
  font-size: 12px;
  font-weight: 700;
}

.music-chart h3,
.music-track-title h3 {
  overflow: hidden;
  font-size: 16px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.music-chart li p,
.music-track-title p,
.music-track-album,
.music-recent-list time {
  overflow: hidden;
  color: var(--muted);
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.music-chart li strong {
  font-family: var(--mono);
  font-size: 11px;
  font-weight: 700;
}

.music-section-heading {
  align-items: end;
  margin-bottom: 18px;
}

.music-section-heading > div {
  display: grid;
  gap: 8px;
  margin-right: auto;
}

.music-section-index {
  color: transparent;
  font-family: var(--display);
  font-size: 64px;
  font-weight: 800;
  line-height: 0.8;
  -webkit-text-stroke: 1px var(--line-strong);
}

.music-recent-list li {
  position: relative;
  display: grid;
  grid-template-columns: 36px 56px minmax(0, 1.4fr) minmax(0, 1fr) auto;
  gap: 16px;
  align-items: center;
  padding: 12px 10px;
  border-bottom: 1px solid var(--line);
  isolation: isolate;
  transition: color 250ms ease;
}

.music-track-art {
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  overflow: hidden;
  background: var(--cobalt);
  color: var(--comet);
}

.music-track-art img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.music-recent-list time {
  font-family: var(--mono);
  font-size: 11px;
}

@media (max-width: 1080px) {
  .music-recent-list li {
    grid-template-columns: 32px 56px minmax(0, 1fr) auto;
  }

  .music-track-album {
    display: none;
  }
}

@media (max-width: 800px) {
  .music-stats,
  .music-charts {
    grid-template-columns: 1fr;
  }

  .music-now {
    grid-template-columns: 1fr;
  }

  .music-now-deck {
    justify-self: center;
  }

  .music-recent-list li {
    grid-template-columns: 28px 48px minmax(0, 1fr);
  }

  .music-track-art {
    width: 48px;
    height: 48px;
  }

  .music-recent-list time {
    display: none;
  }
}
</style>
