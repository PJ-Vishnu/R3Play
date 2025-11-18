
export type Song = {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  albumArtUrl: string;
  imageHint?: string;
  videoId: string;
};

export type YouTubeVideoDetails = {
    duration: number; // in seconds
    thumbnailUrl: string;
}

    