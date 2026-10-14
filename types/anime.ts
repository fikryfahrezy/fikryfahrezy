export enum AnimeListStatus {
  Watching = "watching",
  Completed = "completed",
  OnHold = "on_hold",
  Dropped = "dropped",
  PlanToWatch = "plan_to_watch",
}

export const animeListStatuses = Object.values(AnimeListStatus);

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
