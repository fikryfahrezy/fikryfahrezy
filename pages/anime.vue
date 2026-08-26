<script setup lang="ts">
import { useAnimeList } from "~/composables/useAnimeList";
import type { AnimeListEntry, AnimeListStatus } from "~/types/anime";

const { t } = useI18n();

const {
  data: animeListResponse,
  error,
  refresh,
  status,
} = useAnimeList({ immediate: false });

const animeList = computed(() => animeListResponse.value.entries);
const profileUrl = computed(() => animeListResponse.value.profileUrl);

onMounted(async () => {
  await refresh();
});

const statusOrder: AnimeListStatus[] = [
  "watching",
  "completed",
  "on_hold",
  "dropped",
  "plan_to_watch",
];

const animeGroups = computed(() => {
  const grouped = new Map<AnimeListStatus, AnimeListEntry[]>();

  for (const anime of animeList.value) {
    const group = grouped.get(anime.status) || [];
    group.push(anime);
    grouped.set(anime.status, group);
  }

  return statusOrder
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
    <section class="anime-page-header">
      <p class="anime-page-index" aria-hidden="true">03</p>
      <div class="anime-page-title">
        <p class="section-kicker">{{ t("anime.eyebrow") }}</p>
        <h1>
          <span>{{ t("anime.titleLead") }}</span>
          <span>{{ t("anime.titleTrail") }}</span>
        </h1>
      </div>
      <div class="anime-page-summary">
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
      </div>
    </section>

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
        <header class="anime-group-heading">
          <p class="anime-group-index" aria-hidden="true">
            {{ String(groupIndex + 1).padStart(2, "0") }} /
            {{ String(animeGroups.length).padStart(2, "0") }}
          </p>
          <div>
            <p class="meta-label">{{ t("anime.listStatus") }}</p>
            <h2 :id="`anime-group-${group.key}`">{{ group.label }}</h2>
          </div>
          <p class="anime-group-count">
            {{ t("anime.titleCount", group.entries.length) }}
          </p>
        </header>

        <div class="anime-grid">
          <article
            v-for="anime in group.entries"
            :key="anime.id"
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
