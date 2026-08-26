<script setup lang="ts">
const { locale, t } = useI18n();

const {
  data: musicResponse,
  error,
  refresh,
  status,
} = useMusic({ immediate: false });

onMounted(async () => {
  await refresh();
});

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
    <section class="music-page-header">
      <p class="music-page-index" aria-hidden="true">04</p>
      <div class="music-page-title">
        <p class="section-kicker">{{ t("music.eyebrow") }}</p>
        <h1>
          <span>{{ t("music.titleLead") }}</span>
          <span>{{ t("music.titleTrail") }}</span>
        </h1>
      </div>
      <div class="music-page-summary">
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
      </div>
    </section>

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
      <section v-if="featuredTrack" class="music-now" aria-live="polite">
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
          class="music-now-art"
          :href="featuredTrack.url"
          target="_blank"
          rel="noreferrer"
          :aria-label="`${featuredTrack.name} — Last.fm`"
        >
          <img
            v-if="featuredTrack.image"
            :src="featuredTrack.image"
            :alt="`${featuredTrack.name} artwork`"
            width="300"
            height="300"
          />
          <span v-else aria-hidden="true">♪</span>
        </a>
      </section>

      <section class="music-stats" :aria-label="t('music.listeningStats')">
        <article v-for="(stat, index) in stats" :key="stat.label">
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
        <div class="music-chart">
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

        <div class="music-chart">
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
        <header class="music-section-heading">
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
