
"use client";

import Image from "next/image";
import { Clock, Equal, Loader, Music, Music4, Plus } from "lucide-react";
import type { AnalyzeListeningHistoryOutput } from "@/ai/flows/analyze-listening-history";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { Song } from "@/lib/types";
import { Button } from "../ui/button";

type MainViewProps = {
  view: "playlist" | "analysis";
  playlist: Song[];
  analysisResult: AnalyzeListeningHistoryOutput | null;
  isLoading: boolean;
  onPlaySong: (songId: string) => void;
  activeSongId?: string | null;
  onAddToPlaylist: (song: Song) => void;
};

export default function MainView({
  view,
  playlist,
  analysisResult,
  isLoading,
  onPlaySong,
  activeSongId,
  onAddToPlaylist,
}: MainViewProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (view === "analysis") {
    return <AnalysisView result={analysisResult} />;
  }

  return (
    <PlaylistView
      playlist={playlist}
      onPlaySong={onPlaySong}
      activeSongId={activeSongId}
      onAddToPlaylist={onAddToPlaylist}
    />
  );
}

function PlaylistView({
  playlist,
  onPlaySong,
  activeSongId,
  onAddToPlaylist,
}: {
  playlist: Song[];
  onPlaySong: (songId: string) => void;
  activeSongId?: string | null;
  onAddToPlaylist: (song: Song) => void;
}) {
  if (playlist.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center text-muted-foreground animate-in fade-in-50">
        <Music4 className="w-16 h-16 mb-4 text-muted-foreground/50" />
        <h3 className="text-xl font-headline text-foreground">
          Your personal DJ is ready
        </h3>
        <p>Use the AI controls above to generate a playlist.</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in-50">
      <h2 className="font-headline text-3xl font-bold mb-4">Current Playlist</h2>
      <Table>
        <TableHeader>
          <TableRow className="border-border">
            <TableHead className="w-[50px]">#</TableHead>
            <TableHead>Title</TableHead>
            <TableHead className="hidden md:table-cell">Album</TableHead>
            <TableHead className="hidden md:table-cell w-[50px]"></TableHead>
            <TableHead className="text-right">
              <Clock className="inline-block w-4 h-4" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {playlist.map((song, index) => {
            const isActive = song.id === activeSongId;
            return (
              <TableRow
                key={song.id}
                onClick={() => onPlaySong(song.id)}
                className={cn(
                  "cursor-pointer border-transparent hover:bg-secondary/50 group",
                  isActive && "bg-primary/10 text-primary"
                )}
              >
                <TableCell className="font-medium">
                  {isActive ? (
                    <Equal className="w-5 h-5 text-accent icon-glow" />
                  ) : (
                    <span className="text-muted-foreground">{index + 1}</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-4">
                    <Image
                      src={song.albumArtUrl}
                      alt={song.album}
                      width={40}
                      height={40}
                      className="rounded-md"
                      data-ai-hint={song.imageHint || "album art"}
                    />
                    <div>
                      <div
                        className={cn(
                          "font-semibold",
                          isActive ? "text-primary" : "text-foreground"
                        )}
                      >
                        {song.title}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {song.artist}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">
                  {song.album}
                </TableCell>
                 <TableCell className="hidden md:table-cell">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToPlaylist(song);
                    }}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {`${Math.floor(song.duration / 60)}:${(song.duration % 60)
                    .toString()
                    .padStart(2, "0")}`}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function AnalysisView({
  result,
}: {
  result: AnalyzeListeningHistoryOutput | null;
}) {
  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground">
        <Music className="w-12 h-12 mb-4" />
        <p>No analysis data available.</p>
        <p>Click &quot;Analyze Taste&quot; in the sidebar to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in-50">
      <Card className="bg-secondary/30 border-border">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Taste Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-lg">
            {result.overallTasteProfile}
          </p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-secondary/30 border-border">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Top Genres</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {result.genrePreferences.map((genre) => (
                <Badge
                  key={genre}
                  variant="secondary"
                  className="text-base py-1 px-3 bg-accent/20 text-accent-foreground border border-accent/30"
                >
                  {genre}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-secondary/30 border-border">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Top Artists</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {result.artistPreferences.map((artist) => (
                <Badge
                  key={artist}
                  variant="outline"
                  className="text-base py-1 px-3 border-primary/50 text-primary"
                >
                  {artist}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-secondary/30 border-border">
        <CardHeader>
          <CardTitle className="font-headline text-xl">Top Songs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {result.songPreferences.map((song) => (
              <Badge
                key={song}
                variant="outline"
                className="text-base py-1 px-3 font-normal"
              >
                {song}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
