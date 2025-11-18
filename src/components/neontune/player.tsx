
"use client";

import Image from "next/image";
import { Pause, Play, SkipBack, SkipForward } from "lucide-react";
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
  onProgressChange: (value: number) => void;
};

export default function Player({
  song,
  isPlaying,
  progress,
  onPlayPause,
  onNext,
  onPrev,
  onProgressChange,
}: PlayerProps) {
  const formatTime = (seconds: number) => {
    const totalSeconds = Math.floor(seconds);
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 h-auto md:h-[90px] bg-background/90 backdrop-blur-lg border-t border-primary/20 z-50 flex items-center px-4 md:px-6 py-2 md:py-0">
      <div className="flex flex-col md:flex-row items-center gap-4 w-full">
        {/* Song Info */}
        <div className="flex items-center gap-3 w-full md:w-1/4 md:max-w-[250px]">
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
              onValueChange={(value) => onProgressChange(value[0])}
              max={100}
              step={1}
            />
            <span className="text-xs text-muted-foreground tabular-nums">
              {formatTime(song.duration)}
            </span>
          </div>
        </div>
        <div className="w-1/4 max-w-[250px] hidden md:block"></div>
      </div>
    </div>
  );
}
