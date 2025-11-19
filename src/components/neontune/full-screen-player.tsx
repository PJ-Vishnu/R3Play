
"use client";

import React from "react";
import Image from "next/image";
import { ChevronDown, Pause, Play, SkipBack, SkipForward } from "lucide-react";
import ReactPlayer from 'react-player/youtube';
import type { Song } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

type FullScreenPlayerProps = {
  song: Song;
  isPlaying: boolean;
  progress: number;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onProgressChange: (state: { played: number, playedSeconds: number, loaded: number, loadedSeconds: number }) => void;
  onEnded: () => void;
  onClose: () => void;
};

export default function FullScreenPlayer({
  song,
  isPlaying,
  progress,
  onPlayPause,
  onNext,
  onPrev,
  onProgressChange,
  onEnded,
  onClose,
}: FullScreenPlayerProps) {
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

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-2xl z-[100] flex flex-col p-4 animate-in fade-in-0 slide-in-from-bottom-10 duration-500">
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

      <header className="flex-shrink-0">
        <Button variant="ghost" size="icon" onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <ChevronDown className="w-8 h-8" />
        </Button>
      </header>
      
      <main className="flex-1 flex flex-col items-center justify-center gap-8 md:gap-12 text-center px-4">
        <div className="relative w-full max-w-md aspect-square shadow-2xl shadow-primary/20 rounded-lg overflow-hidden">
          <Image
            src={song.albumArtUrl}
            alt={song.album}
            fill
            className="object-cover"
            data-ai-hint={song.imageHint || "album art"}
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>

        <div className="w-full">
            <h2 className="text-3xl font-bold font-headline truncate">{song.title}</h2>
            <p className="text-lg text-muted-foreground mt-1 truncate">{song.artist}</p>
        </div>
        
        <div className="w-full max-w-md">
            <div className="w-full flex items-center gap-2 mb-2">
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
            <div className="flex items-center justify-center gap-4">
              <Button variant="ghost" size="icon" onClick={onPrev} className="text-muted-foreground hover:text-foreground w-16 h-16">
                <SkipBack className="w-8 h-8" />
              </Button>
              <Button
                size="icon"
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full w-20 h-20 shadow-lg shadow-primary/30"
                onClick={onPlayPause}
              >
                {isPlaying ? (
                  <Pause className="w-10 h-10 fill-current" />
                ) : (
                  <Play className="w-10 h-10 fill-current ml-1" />
                )}
              </Button>
              <Button variant="ghost" size="icon" onClick={onNext} className="text-muted-foreground hover:text-foreground w-16 h-16">
                <SkipForward className="w-8 h-8" />
              </Button>
            </div>
        </div>

      </main>

      <footer className="flex-shrink-0 h-10" />
    </div>
  );
}

    