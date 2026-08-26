import type { AnimeListEntry, AnimeListStatus } from "~/types/anime";

interface MalAnimeNode {
  id: number;
  title: string;
  main_picture?: {
    medium?: string;
    large?: string;
  };
  media_type?: string;
  num_episodes?: number;
}

interface MalAnimeListItem {
  node: MalAnimeNode;
  list_status: {
    status: AnimeListStatus;
    score: number;
    num_episodes_watched: number;
    updated_at: string;
  };
}

interface MalAnimeListResponse {
  data: MalAnimeListItem[];
  paging?: {
    next?: string;
  };
}

const getMyAnimeList = defineCachedFunction(
  async (username: string, clientId: string) => {
    const entries: AnimeListEntry[] = [];
    let nextUrl: string | undefined =
      `https://api.myanimelist.net/v2/users/${encodeURIComponent(username)}/animelist`;

    while (nextUrl) {
      const response: MalAnimeListResponse = await $fetch(nextUrl, {
        headers: { "X-MAL-CLIENT-ID": clientId },
        query: nextUrl.includes("?")
          ? undefined
          : {
              fields: "list_status,media_type,num_episodes",
              limit: 1000,
              sort: "list_updated_at",
            },
      });

      entries.push(
        ...response.data.map(({ node, list_status }) => ({
          id: node.id,
          title: node.title,
          image: node.main_picture?.large || node.main_picture?.medium || null,
          status: list_status.status,
          score: list_status.score,
          watchedEpisodes: list_status.num_episodes_watched,
          totalEpisodes: node.num_episodes || 0,
          mediaType: node.media_type || null,
          url: `https://myanimelist.net/anime/${node.id}`,
          updatedAt: list_status.updated_at,
        })),
      );

      nextUrl = response.paging?.next;
    }

    return entries;
  },
  {
    maxAge: 30 * 60,
    name: "myanimelist-anime-list-v1",
    getKey: (username) => username,
    shouldBypassCache: () => Boolean(import.meta.dev),
  },
);

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const username =
    typeof config.malUsername === "string" ? config.malUsername.trim() : "";
  const clientId =
    typeof config.malClientId === "string" ? config.malClientId : "";

  setResponseHeader(event, "Cache-Control", "private, no-store");

  if (!username) {
    throw createError({
      statusCode: 503,
      statusMessage: "MyAnimeList username is not configured",
    });
  }

  if (!clientId) {
    throw createError({
      statusCode: 503,
      statusMessage: "MyAnimeList is not configured",
    });
  }

  return {
    profileUrl: `https://myanimelist.net/profile/${encodeURIComponent(username)}`,
    entries: await getMyAnimeList(username, clientId),
  };
});
