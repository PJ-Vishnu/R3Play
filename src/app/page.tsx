
"use client";

import * as React from "react";
import {
  ChevronsLeft,
  ChevronsRight,
  ListMusic,
  Loader,
  Mic,
  Music,
  PanelLeft,
  Sparkles,
  User,
} from "lucide-react";
import type { AnalyzeListeningHistoryOutput } from "@/ai/flows/analyze-listening-history";
import { analyzeHistoryAction, generatePlaylistAction } from "@/app/actions";
import MainView from "@/components/neontune/main-view";
import Player from "@/components/neontune/player";
import NeonTuneSidebar from "@/components/neontune/sidebar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import { LISTENING_HISTORY, SONGS } from "@/lib/data";
import type { Song } from "@/lib/types";

export default function Home() {
  const [playlist, setPlaylist] = React.useState<Song[]>(SONGS.slice(0, 10));
  const [currentSongIndex, setCurrentSongIndex] = React.useState<number | null>(
    null
  );
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [activeView, setActiveView] = React.useState<"playlist" | "analysis">(
    "playlist"
  );
  const [analysisResult, setAnalysisResult] =
    React.useState<AnalyzeListeningHistoryOutput | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [request, setRequest] = React.useState("");

  const { toast } = useToast();

  const currentSong =
    currentSongIndex !== null ? playlist[currentSongIndex] : null;

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentSong) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            handleNext();
            return 0;
          }
          return prev + 100 / currentSong.duration;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentSong]);

  const handlePlayPause = () => {
    if (currentSongIndex === null && playlist.length > 0) {
      setCurrentSongIndex(0);
      setIsPlaying(true);
      setProgress(0);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleNext = () => {
    if (playlist.length === 0) return;
    setCurrentSongIndex((prevIndex) => {
      const newIndex =
        prevIndex === null
          ? 0
          : (prevIndex + 1) % playlist.length;
      return newIndex;
    });
    setProgress(0);
    setIsPlaying(true);
  };

  const handlePrev = () => {
    if (playlist.length === 0) return;
    setCurrentSongIndex((prevIndex) => {
      if (prevIndex === null) return 0;
      const newIndex =
        prevIndex === 0 ? playlist.length - 1 : prevIndex - 1;
      return newIndex;
    });
    setProgress(0);
    setIsPlaying(true);
  };

  const handlePlaySong = (songId: string) => {
    const songIndex = playlist.findIndex((s) => s.id === songId);
    if (songIndex !== -1) {
      setCurrentSongIndex(songIndex);
      setProgress(0);
      setIsPlaying(true);
    }
  };

  const handleAnalyzeHistory = async () => {
    setIsLoading(true);
    setActiveView("analysis");
    try {
      const result = await analyzeHistoryAction(LISTENING_HISTORY);
      setAnalysisResult(result);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "Could not analyze listening history.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneratePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!request) return;
    setIsLoading(true);
    setActiveView("playlist");
    try {
      const { playlist: playlistNames } = await generatePlaylistAction(
        LISTENING_HISTORY,
        request
      );

      // This is a simulation. In a real app, you'd search for these songs.
      const newPlaylist = playlistNames
        .map((name) => SONGS.find((s) => s.title === name))
        .filter((s): s is Song => !!s)
        .slice(0, 15);
      
      const otherSongs = SONGS.filter(song => !playlistNames.includes(song.title));
      let remainingSlots = 15 - newPlaylist.length;
      while(remainingSlots > 0 && otherSongs.length > 0) {
        const randomIndex = Math.floor(Math.random() * otherSongs.length);
        newPlaylist.push(otherSongs[randomIndex]);
        otherSongs.splice(randomIndex, 1);
        remainingSlots--;
      }

      setPlaylist(newPlaylist);
      setRequest("");
      toast({
        title: "Playlist Generated!",
        description: `Your new playlist based on "${request}" is ready.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Playlist Generation Failed",
        description: "Could not generate a new playlist.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const viewPlaylist = () => {
    setActiveView("playlist");
  };

  return (
    <SidebarProvider>
      <div className="bg-background min-h-svh">
        <NeonTuneSidebar
          onAnalyze={handleAnalyzeHistory}
          onViewPlaylist={viewPlaylist}
        />
        <SidebarInset>
          <div className="flex flex-col h-full max-h-svh overflow-hidden">
            <header className="flex h-16 items-center justify-between border-b border-primary/20 px-4 shrink-0">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="md:hidden" />
                <div className="flex items-center gap-2">
                  <Music className="w-6 h-6 text-accent icon-glow" />
                  <h1 className="text-xl font-headline font-bold text-primary text-glow">
                    NeonTune
                  </h1>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <User className="w-5 h-5" />
                </Button>
              </div>
            </header>

            <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-[120px]">
              <Card className="mb-6 bg-card border border-primary/20 shadow-lg shadow-primary/10">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-6 h-6 text-primary icon-glow" />
                    <CardTitle className="font-headline text-2xl text-glow">
                      AI DJ Controls
                    </CardTitle>
                  </div>
                  <CardDescription>
                    Request a song, artist, or vibe to generate a new playlist.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form
                    onSubmit={handleGeneratePlaylist}
                    className="flex gap-2"
                  >
                    <Input
                      placeholder="e.g., '90s rock classics' or 'upbeat electronic'"
                      value={request}
                      onChange={(e) => setRequest(e.target.value)}
                      className="text-base"
                      disabled={isLoading}
                    />
                    <Button type="submit" disabled={isLoading} size="lg" className="font-bold">
                      {isLoading ? (
                        <Loader className="animate-spin" />
                      ) : (
                        <Mic />
                      )}
                      <span className="hidden sm:inline">Request</span>
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <MainView
                view={activeView}
                playlist={playlist}
                analysisResult={analysisResult}
                isLoading={isLoading}
                onPlaySong={handlePlaySong}
                activeSongId={currentSong?.id}
              />
            </main>

            {currentSong && (
              <Player
                song={currentSong}
                isPlaying={isPlaying}
                progress={progress}
                onPlayPause={handlePlayPause}
                onNext={handleNext}
                onPrev={handlePrev}
                onProgressChange={setProgress}
              />
            )}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
