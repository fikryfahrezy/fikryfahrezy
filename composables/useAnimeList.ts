import type { AnimeListResponse } from "~/types/anime";

const emptyAnimeList = (): AnimeListResponse => ({
  profileUrl: "",
  entries: [],
});

export function useAnimeList(
  options: { immediate?: boolean; server?: boolean } = {},
) {
  return useFetch<AnimeListResponse>("/api/myanimelist", {
    key: "myanimelist",
    default: emptyAnimeList,
    immediate: options.immediate ?? true,
    server: options.server ?? true,
  });
}
