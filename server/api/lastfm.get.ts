import type {
  MusicResponse,
  MusicTopArtist,
  MusicTopTrack,
  MusicTrack,
} from "~/types/music";

interface LastFmImage {
  "#text": string;
  size: string;
}

interface LastFmRecentTrack {
  name: string;
  artist: { "#text": string };
  album: { "#text": string };
  image?: LastFmImage[];
  url: string;
  date?: { uts: string };
  "@attr"?: { nowplaying?: string };
}

interface LastFmTopTrack {
  name: string;
  artist: { name: string };
  image?: LastFmImage[];
  url: string;
  playcount: string;
}

interface LastFmTopArtist {
  name: string;
  image?: LastFmImage[];
  url: string;
  playcount: string;
}

interface LastFmUserInfoResponse {
  user: {
    playcount: string;
  };
}

interface LastFmRecentTracksResponse {
  recenttracks: {
    track: LastFmRecentTrack[];
  };
}

interface LastFmTopTracksResponse {
  toptracks: {
    track: LastFmTopTrack[];
    "@attr": { total: string };
  };
}

interface LastFmTopArtistsResponse {
  topartists: {
    artist: LastFmTopArtist[];
    "@attr": { total: string };
  };
}

interface LastFmErrorResponse {
  error: number;
  message: string;
}

const imageUrl = (images?: LastFmImage[]) =>
  [...(images || [])].reverse().find((image) => image["#text"].trim())?.[
    "#text"
  ] || null;

const numberFrom = (value: string | undefined) => {
  const parsed = Number.parseInt(value || "0", 10);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getLastFmData = async (
  username: string,
  apiKey: string,
): Promise<MusicResponse> => {
  const request = async <T>(method: string, query: Record<string, string>) => {
    const response = await $fetch<T | LastFmErrorResponse>(
      "https://ws.audioscrobbler.com/2.0/",
      {
        query: {
          method,
          user: username,
          api_key: apiKey,
          format: "json",
          ...query,
        },
      },
    );

    if (
      typeof response === "object" &&
      response !== null &&
      "error" in response
    ) {
      throw createError({
        statusCode: 502,
        statusMessage: response.message || "Last.fm request failed",
      });
    }

    return response as T;
  };

  const [userInfo, recent, topTracks, topArtists] = await Promise.all([
    request<LastFmUserInfoResponse>("user.getinfo", {}),
    request<LastFmRecentTracksResponse>("user.getrecenttracks", {
      limit: "12",
    }),
    request<LastFmTopTracksResponse>("user.gettoptracks", {
      limit: "6",
      period: "overall",
    }),
    request<LastFmTopArtistsResponse>("user.gettopartists", {
      limit: "6",
      period: "overall",
    }),
  ]);

  const recentTracks: MusicTrack[] = recent.recenttracks.track.map((track) => ({
    name: track.name,
    artist: track.artist["#text"],
    album: track.album["#text"] || null,
    image: imageUrl(track.image),
    url: track.url,
    playedAt: track.date?.uts
      ? new Date(numberFrom(track.date.uts) * 1000).toISOString()
      : null,
    nowPlaying: track["@attr"]?.nowplaying === "true",
  }));

  return {
    profileUrl: `https://www.last.fm/user/${encodeURIComponent(username)}`,
    stats: {
      scrobbles: numberFrom(userInfo.user.playcount),
      artists: numberFrom(topArtists.topartists["@attr"].total),
      tracks: numberFrom(topTracks.toptracks["@attr"].total),
    },
    recentTracks,
    topTracks: topTracks.toptracks.track.map(
      (track): MusicTopTrack => ({
        name: track.name,
        artist: track.artist.name,
        image: imageUrl(track.image),
        url: track.url,
        playCount: numberFrom(track.playcount),
      }),
    ),
    topArtists: topArtists.topartists.artist.map(
      (artist): MusicTopArtist => ({
        name: artist.name,
        image: imageUrl(artist.image),
        url: artist.url,
        playCount: numberFrom(artist.playcount),
      }),
    ),
  };
};

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const username =
    typeof config.lastfmUsername === "string"
      ? config.lastfmUsername.trim()
      : "";
  const apiKey =
    typeof config.lastfmApiKey === "string" ? config.lastfmApiKey.trim() : "";

  setResponseHeader(event, "Cache-Control", "private, no-store");

  if (!username) {
    throw createError({
      statusCode: 503,
      statusMessage: "Last.fm username is not configured",
    });
  }

  if (!apiKey) {
    throw createError({
      statusCode: 503,
      statusMessage: "Last.fm API key is not configured",
    });
  }

  return getLastFmData(username, apiKey);
});
