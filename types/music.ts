export interface MusicTrack {
  name: string;
  artist: string;
  album: string | null;
  image: string | null;
  url: string;
  playedAt: string | null;
  nowPlaying: boolean;
}

export interface MusicTopTrack {
  name: string;
  artist: string;
  image: string | null;
  url: string;
  playCount: number;
}

export interface MusicTopArtist {
  name: string;
  image: string | null;
  url: string;
  playCount: number;
}

export interface MusicStats {
  scrobbles: number;
  artists: number;
  tracks: number;
}

export interface MusicResponse {
  profileUrl: string;
  stats: MusicStats;
  recentTracks: MusicTrack[];
  topTracks: MusicTopTrack[];
  topArtists: MusicTopArtist[];
}
