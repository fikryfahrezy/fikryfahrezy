import type { MusicResponse } from "~/types/music";

const emptyMusic = (): MusicResponse => ({
  profileUrl: "",
  stats: {
    scrobbles: 0,
    artists: 0,
    tracks: 0,
  },
  recentTracks: [],
  topTracks: [],
  topArtists: [],
});

export function useMusic(
  options: { immediate?: boolean; server?: boolean } = {},
) {
  return useFetch<MusicResponse>("/api/lastfm", {
    key: "lastfm",
    default: emptyMusic,
    immediate: options.immediate ?? true,
    server: options.server ?? true,
  });
}
