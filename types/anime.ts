export type AnimeListStatus =
  | "watching"
  | "completed"
  | "on_hold"
  | "dropped"
  | "plan_to_watch";

export interface AnimeListEntry {
  id: number;
  title: string;
  image: string | null;
  status: AnimeListStatus;
  score: number;
  watchedEpisodes: number;
  totalEpisodes: number;
  mediaType: string | null;
  url: string;
  updatedAt: string;
}

export interface AnimeListResponse {
  profileUrl: string;
  entries: AnimeListEntry[];
}
