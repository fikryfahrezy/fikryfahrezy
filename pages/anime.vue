<script setup lang="ts">
import { useAnimeList } from "~/composables/useAnimeList";
import {
  type AnimeListEntry,
  type AnimeListStatus,
  animeListStatuses,
} from "~/types/anime";

const { t } = useI18n();

const { data: animeListResponse, error, status } = await useAnimeList();

const animeList = computed(() => animeListResponse.value.entries);
const profileUrl = computed(() => animeListResponse.value.profileUrl);

const animeGroups = computed(() => {
  const grouped = new Map<AnimeListStatus, AnimeListEntry[]>();

  for (const anime of animeList.value) {
    const group = grouped.get(anime.status) || [];
    group.push(anime);
    grouped.set(anime.status, group);
  }

  return animeListStatuses
    .filter((key) => grouped.has(key))
    .map((key) => ({
      key,
      label: t(`anime.statuses.${key}`),
      entries: grouped.get(key) || [],
    }));
});

const formatMediaType = (mediaType: string | null) =>
  mediaType ? mediaType.replaceAll("_", " ").toUpperCase() : t("anime.anime");

const episodeProgress = (anime: AnimeListEntry) =>
  anime.totalEpisodes
    ? `${anime.watchedEpisodes} / ${anime.totalEpisodes}`
    : String(anime.watchedEpisodes);

useHead({
  title: () => t("anime.seoTitle"),
});

useSeoMeta({
  description: () => t("anime.description"),
  ogTitle: () => t("anime.seoTitle"),
  ogDescription: () => t("anime.description"),
});
</script>

<template>
  <div class="showcase-page section-wrap">
    <PageHeader
      index="03"
      :kicker="t('anime.eyebrow')"
      :title="`${t('anime.titleLead')} ${t('anime.titleTrail')}`"
      glyph="アニメ"
    >
      <p>{{ t("anime.description") }}</p>
        <p>
          <a
            v-if="profileUrl"
            :href="profileUrl"
            target="_blank"
            rel="noreferrer"
          >
            {{ t("anime.source") }} <span aria-hidden="true">↗</span>
          </a>
          <span v-else>{{ t("anime.source") }}</span>
        </p>
    </PageHeader>

    <section
      v-if="status === 'pending' && animeGroups.length === 0"
      class="showcase-placeholder"
      :aria-label="t('anime.loading')"
      aria-live="polite"
    >
      <p class="showcase-placeholder-index" aria-hidden="true">·· / ··</p>
      <div>
        <p class="meta-label">{{ t("anime.loading") }}</p>
        <h2>{{ t("anime.loadingTitle") }}</h2>
      </div>
      <span class="showcase-placeholder-mark" aria-hidden="true">↘</span>
    </section>

    <section
      v-else-if="error && animeGroups.length === 0"
      class="showcase-placeholder"
      :aria-label="t('anime.errorLabel')"
    >
      <p class="showcase-placeholder-index" aria-hidden="true">ERR / MAL</p>
      <div>
        <p class="meta-label">{{ t("anime.errorLabel") }}</p>
        <h2>{{ t("anime.errorTitle") }}</h2>
        <p>{{ t("anime.errorCopy") }}</p>
      </div>
      <span class="showcase-placeholder-mark" aria-hidden="true">↘</span>
    </section>

    <section
      v-else-if="animeGroups.length === 0"
      class="showcase-placeholder"
      :aria-label="t('anime.emptyLabel')"
    >
      <p class="showcase-placeholder-index" aria-hidden="true">00 / 00</p>
      <div>
        <p class="meta-label">{{ t("anime.emptyLabel") }}</p>
        <h2>{{ t("anime.emptyTitle") }}</h2>
        <p>{{ t("anime.emptyCopy") }}</p>
      </div>
      <span class="showcase-placeholder-mark" aria-hidden="true">↘</span>
    </section>

    <div v-else class="anime-groups">
      <section
        v-for="(group, groupIndex) in animeGroups"
        :key="group.key"
        class="anime-group"
        :aria-labelledby="`anime-group-${group.key}`"
      >
        <header v-reveal class="anime-group-heading">
          <p class="anime-group-index" aria-hidden="true">
            {{ String(groupIndex + 1).padStart(2, "0") }} /
            {{ String(animeGroups.length).padStart(2, "0") }}
          </p>
          <h2 :id="`anime-group-${group.key}`">{{ group.label }}</h2>
          <p class="anime-group-count">
            {{ t("anime.titleCount", group.entries.length) }}
          </p>
        </header>

        <div class="anime-grid">
          <article
            v-for="(anime, animeIndex) in group.entries"
            :key="anime.id"
            v-reveal="(animeIndex % 5) * 50"
            v-tilt
            class="anime-card"
          >
            <a
              class="anime-cover"
              :href="anime.url"
              target="_blank"
              rel="noreferrer"
              :aria-label="`${anime.title} — MyAnimeList`"
            >
              <img
                v-if="anime.image"
                :src="anime.image"
                :alt="`${anime.title} cover`"
                loading="lazy"
                width="225"
                height="318"
              />
              <span v-else aria-hidden="true">MAL</span>
            </a>
            <div class="anime-card-body">
              <div class="anime-card-topline">
                <p class="meta-label">{{ formatMediaType(anime.mediaType) }}</p>
                <span aria-hidden="true">↗</span>
              </div>
              <h3>
                <a :href="anime.url" target="_blank" rel="noreferrer">
                  {{ anime.title }}
                </a>
              </h3>
              <footer class="anime-card-footer">
                <span>{{ t("anime.episodes") }} {{ episodeProgress(anime) }}</span>
                <span v-if="anime.score">★ {{ anime.score }} / 10</span>
                <span v-else>{{ t("anime.notRated") }}</span>
              </footer>
            </div>
          </article>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.anime-groups {
  display: grid;
  gap: clamp(64px, 8vw, 110px);
}

.anime-group-heading {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px 24px;
  padding-bottom: 18px;
  border-bottom: 1px solid var(--line-strong);
}

.anime-group-heading h2 {
  margin-right: auto;
  font-family: var(--display);
  font-size: clamp(34px, 4.6vw, 64px);
  font-weight: 800;
  letter-spacing: -0.045em;
  line-height: 0.95;
}

.anime-group-count {
  color: var(--muted);
  font-family: var(--mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.anime-group-index {
  color: var(--accent);
  font-family: var(--mono);
  font-size: 11px;
  font-weight: 700;
}

.anime-card h3 {
  font-family: var(--display);
  font-size: clamp(22px, 2vw, 28px);
  font-weight: 800;
  letter-spacing: -0.035em;
  line-height: 1.05;
  overflow-wrap: anywhere;
}

/* Stretch the title link over the whole card. */
.anime-card h3 a::before {
  position: absolute;
  z-index: 1;
  inset: 0;
  content: "";
}

.anime-group-heading {
  margin-bottom: 28px;
}

.anime-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: clamp(12px, 1.6vw, 20px);
}

.anime-card {
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--line-strong);
  background: var(--paper-raised);
}

.anime-cover {
  position: relative;
  display: grid;
  place-items: center;
  aspect-ratio: 225 / 318;
  overflow: hidden;
  background: var(--cobalt);
  color: var(--on-cobalt);
  font-family: var(--mono);
}

.anime-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition:
    transform 900ms var(--ease-out),
    filter 400ms ease;
}

/* A cobalt duotone that lifts on hover. */
.anime-cover::after {
  position: absolute;
  inset: 0;
  background: var(--cobalt);
  content: "";
  mix-blend-mode: color;
  opacity: 0.55;
  transition: opacity 400ms ease;
}

.anime-card:hover .anime-cover::after {
  opacity: 0;
}

.anime-card:hover .anime-cover img {
  transform: scale(1.06);
}

.anime-card-body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 10px;
  padding: 14px 16px 16px;
}

.anime-card-topline {
  display: flex;
  justify-content: space-between;
  color: var(--accent);
}

.anime-card-topline .meta-label {
  font-size: 10px;
}

.anime-card h3 {
  font-size: 18px;
  letter-spacing: -0.02em;
}

.anime-card-footer {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-top: auto;
  padding-top: 10px;
  border-top: 1px solid var(--line);
  color: var(--muted);
  font-family: var(--mono);
  font-size: 10.5px;
}

@media (max-width: 800px) {
  .anime-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
