
"use client";

import React from "react";
import Image from "next/image";
import { Pause, Play, SkipBack, SkipForward } from "lucide-react";
import ReactPlayer from 'react-player/youtube';
import type { Song } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

type PlayerProps = {
  song: Song;
  isPlaying: boolean;
  progress: number;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onProgressChange: (state: { played: number, playedSeconds: number, loaded: number, loadedSeconds: number }) => void;
  onEnded: () => void;
  onOpenFullScreen: () => void;
};

export default function Player({
  song,
  isPlaying,
  progress,
  onPlayPause,
  onNext,
  onPrev,
  onProgressChange,
  onEnded,
  onOpenFullScreen,
}: PlayerProps) {
  const formatTime = (seconds: number) => {
    const totalSeconds = Math.floor(seconds);
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const playerRef = React.useRef<ReactPlayer>(null);

  const handleSliderChange = (value: number[]) => {
    const newProgress = value[0];
    if (playerRef.current) {
        playerRef.current.seekTo(newProgress / 100);
    }
  };
  
  const YtMusicLogo = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z" fill="#FF0000"/>
      <path d="M12 17.5C14.9625 17.5 17.5 14.9625 17.5 12C17.5 9.0375 14.9625 6.5 12 6.5C9.0375 6.5 6.5 9.0375 6.5 12C6.5 14.9625 9.0375 17.5 12 17.5Z" fill="white"/>
      <path d="M10.15 14.2375L15.3 12L10.15 9.7625V14.2375Z" fill="#FF0000"/>
    </svg>
  );


  return (
    <div className="fixed bottom-0 left-0 right-0 h-auto bg-background/90 backdrop-blur-lg border-t border-border z-50 md:h-[90px]">
      <div className="max-w-screen-xl mx-auto flex items-center px-4 md:px-6 py-3 md:py-0 h-full">
        <div style={{ display: 'none' }}>
          <ReactPlayer
              ref={playerRef}
              url={`https://www.youtube.com/watch?v=${song.videoId}`}
              playing={isPlaying}
              onProgress={onProgressChange}
              onEnded={onEnded}
              width="0"
              height="0"
              config={{
                  youtube: {
                      playerVars: {
                          autoplay: 1,
                      }
                  }
              }}
          />
        </div>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full">
          {/* Song Info */}
          <div
            className="flex items-center gap-3 w-full md:w-1/4 md:max-w-[250px] cursor-pointer"
            onClick={onOpenFullScreen}
          >
            <Image
              src={song.albumArtUrl}
              alt={song.album}
              width={56}
              height={56}
              className="rounded-md shadow-lg"
              data-ai-hint={song.imageHint || "album art"}
            />
            <div className="overflow-hidden">
              <p className="font-bold truncate text-base">{song.title}</p>
              <p className="text-sm text-muted-foreground truncate">
                {song.artist}
              </p>
            </div>
          </div>

          {/* Player Controls */}
          <div className="w-full md:flex-1 flex flex-col items-center justify-center gap-2">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={onPrev} className="text-muted-foreground hover:text-foreground">
                <SkipBack className="w-6 h-6" />
              </Button>
              <Button
                size="icon"
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full w-12 h-12 shadow-lg shadow-primary/30"
                onClick={onPlayPause}
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 fill-current" />
                ) : (
                  <Play className="w-6 h-6 fill-current ml-1" />
                )}
              </Button>
              <Button variant="ghost" size="icon" onClick={onNext} className="text-muted-foreground hover:text-foreground">
                <SkipForward className="w-6 h-6" />
              </Button>
            </div>
            <div className="w-full max-w-xl flex items-center gap-2">
              <span className="text-xs text-muted-foreground tabular-nums">
                {formatTime((progress / 100) * song.duration)}
              </span>
              <Slider
                value={[progress]}
                onValueChange={handleSliderChange}
                max={100}
                step={1}
              />
              <span className="text-xs text-muted-foreground tabular-nums">
                {formatTime(song.duration)}
              </span>
            </div>
          </div>
          <div className="w-1/4 max-w-[250px] hidden md:flex items-center justify-end">
              <a href={`https://music.youtube.com/watch?v=${song.videoId}`} target="_blank" rel="noopener noreferrer" className="opacity-70 hover:opacity-100 transition-opacity">
                  <YtMusicLogo />
              </a>
          </div>
        </div>
      </div>
    </div>
  );
}

    