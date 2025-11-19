
"use client";

import * as React from "react";
import {
  Equal,
  ListMusic,
  Loader,
  Mic,
  Music,
  Sparkles,
  User,
  LogOut,
  ListPlus,
  Plus,
  ThumbsUp,
  PanelLeft,
} from "lucide-react";
import type { AnalyzeListeningHistoryOutput } from "@/ai/flows/analyze-listening-history";
import { analyzeHistoryAction, generatePlaylistAction } from "@/app/actions";
import MainView from "@/components/neontune/main-view";
import Player from "@/components/neontune/player";
import NeonTuneSidebar from "@/components/neontune/sidebar";
import FullScreenPlayer from "@/components/neontune/full-screen-player";
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
  useSidebar,
} from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import type { Song } from "@/lib/types";
import { searchSongOnYouTube, getYouTubeVideoDetails } from "@/lib/youtube";
import { useYouTube } from "@/context/youtube-context";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";


export default function Home() {
  const [playlist, setPlaylist] = React.useState<Song[]>([]);
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
  const [isExtendingRadio, setIsExtendingRadio] = React.useState(false);
  const [request, setRequest] = React.useState("");
  const [isRadioMode, setIsRadioMode] = React.useState(false);
  const [isFullScreenPlayer, setIsFullScreenPlayer] = React.useState(false);

  // Playlist management state
  const [isAddToPlaylistOpen, setIsAddToPlaylistOpen] = React.useState(false);
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = React.useState(false);
  const [songToAdd, setSongToAdd] = React.useState<Song | null>(null);
  const [newPlaylistName, setNewPlaylistName] = React.useState("");
  const [isCreatingPlaylist, setIsCreatingPlaylist] = React.useState(false);


  const { toast } = useToast();
  const {
    isLoggedIn,
    setIsLoggedIn,
    playlists,
    setPlaylists,
    likedMusicPlaylist,
    setLikedMusicPlaylist,
    listeningHistory,
    setListeningHistory,
    isLoadingPlaylists,
    setIsLoadingPlaylists,
    clearYouTubeData,
  } = useYouTube();

  const currentSong =
    currentSongIndex !== null ? playlist[currentSongIndex] : null;

  // Load analysis result from localStorage on initial render
  React.useEffect(() => {
    try {
      const storedAnalysis = localStorage.getItem('yt-analysisResult');
      if (storedAnalysis) {
        setAnalysisResult(JSON.parse(storedAnalysis));
      }
    } catch (error) {
      console.error("Failed to parse analysis result from localStorage", error);
      localStorage.removeItem('yt-analysisResult');
    }
  }, []);

  const handlePlayPause = () => {
    if (currentSongIndex === null && playlist.length > 0) {
      setCurrentSongIndex(0);
      setIsPlaying(true);
      setProgress(0);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const extendRadio = async () => {
    if (isExtendingRadio) return; // Prevent multiple simultaneous requests
    console.log("Extending radio playlist...");
    setIsExtendingRadio(true);
    try {
      const history = isLoggedIn ? (listeningHistory.length > 0 ? JSON.stringify(listeningHistory) : "") : "";
      const radioRequest = 'a radio mix based on my taste, continuing from the current playlist';

      const response = await generatePlaylistAction(
        history,
        radioRequest
      );
      
      const newSongNames = response?.playlist;

      if (!newSongNames || !Array.isArray(newSongNames)) {
        console.error("Invalid response from generatePlaylistAction");
        return;
      }

      // We only want a few new songs to append
      const processedNewSongs = await processSongNames(newSongNames.slice(0, 5));
      if (processedNewSongs.length > 0) {
        setPlaylist(prev => [...prev, ...processedNewSongs]);
        toast({
          title: "Radio Extended",
          description: `Added ${processedNewSongs.length} new songs to the queue.`,
        });
      }
    } catch (error) {
       console.error("Failed to extend radio playlist", error);
    } finally {
        setIsExtendingRadio(false);
    }
  };

  const handleNext = () => {
    if (playlist.length === 0) return;
    
    setCurrentSongIndex((prevIndex) => {
        if (prevIndex === null) {
            setProgress(0);
            setIsPlaying(true);
            return 0;
        }

        // If it's the last song in radio mode, extend the playlist
        if (prevIndex === playlist.length - 1 && isRadioMode) {
          extendRadio(); 
          // The index will continue to the new songs when they are added
        }
        
        // Stop playback if it's the last song and not in radio mode.
        if (prevIndex === playlist.length - 1 && !isRadioMode) {
            setIsPlaying(false);
            return prevIndex;
        }

        const newIndex = (prevIndex + 1) % playlist.length;
        setProgress(0);
        setIsPlaying(true);
        return newIndex;
    });
  };

  const handlePrev = () => {
    if (playlist.length === 0) return;
    setCurrentSongIndex((prevIndex) => {
      if (prevIndex === null) {
        setProgress(0);
        setIsPlaying(true);
        return 0;
      }
      const newIndex =
        prevIndex === 0 ? playlist.length - 1 : prevIndex - 1;
      setProgress(0);
      setIsPlaying(true);
      return newIndex;
    });
  };

  const handlePlaySong = (songId: string) => {
    const songIndex = playlist.findIndex((s) => s.id === songId);
    if (songIndex !== -1) {
      setCurrentSongIndex(songIndex);
      setProgress(0);
      setIsPlaying(true);
    }
  };

  const getHistoryForAI = () => {
      // Prioritize using the stored analysis result
    if (analysisResult) {
      return JSON.stringify(analysisResult);
    }
    if (!isLoggedIn) {
      toast({
        variant: "destructive",
        title: "Not Logged In",
        description: "Please log in with YouTube to use your listening history.",
      });
      return null;
    }
    if (listeningHistory.length === 0) {
      toast({
        title: "No Listening History Found",
        description: "Generating playlist without taste profile. Like some songs on YouTube Music to build one!",
      });
      return "";
    }
    return JSON.stringify(listeningHistory);
  }

  const handleAnalyzeHistory = async () => {
    if (!isLoggedIn) {
         toast({
            variant: "destructive",
            title: "Not Logged In",
            description: "Please log in with YouTube to use your listening history.",
        });
        return;
    }
     if (listeningHistory.length === 0) {
        toast({
            variant: "destructive",
            title: "No Listening History",
            description: "We couldn't find any liked songs. Please like some songs on YouTube Music to build your profile.",
        });
        return;
    }
    
    setIsLoading(true);
    setActiveView("analysis");
    try {
      const historyString = JSON.stringify(listeningHistory);
      const result = await analyzeHistoryAction(historyString);
      setAnalysisResult(result);
      localStorage.setItem('yt-analysisResult', JSON.stringify(result)); // Save to localStorage
      toast({
        title: "Taste Profile Generated!",
        description: "Your music taste has been analyzed and will be remembered."
      });
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

    const processSongNames = async (songNames: string[]): Promise<Song[]> => {
      const newSongs: Song[] = await Promise.all(
        songNames.map(async (name) => {
          if (typeof name !== 'string') return null;
          const [title, artist] = name.split(' by ');
          const videoId = await searchSongOnYouTube(title, artist || '');
          let videoDetails = null;
          if (videoId) {
            videoDetails = await getYouTubeVideoDetails(videoId);
          }

          return {
            id: videoId || crypto.randomUUID(),
            title: title || name,
            artist: artist || 'Unknown Artist',
            album: 'AI Playlist',
            duration: videoDetails?.duration || 180,
            albumArtUrl: videoDetails?.thumbnailUrl || `https://picsum.photos/seed/${Math.random()}/400/400`,
            imageHint: 'album art',
            videoId: videoId || '',
          };
        })
      );
      return newSongs.filter((song): song is Song => !!song && !!song.videoId);
    }

    const processGeneratedPlaylist = async (playlistNames: string[]) => {
      const newPlaylist = await processSongNames(playlistNames);

      if (newPlaylist.length > 0) {
        setPlaylist(newPlaylist);
        setRequest("");
        setCurrentSongIndex(0);
        setProgress(0);
        setIsPlaying(true);
        toast({
          title: "Playlist Generated!",
          description: `Your new playlist is ready.`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Playlist Generation Failed",
          description: "Could not find any songs for your request.",
        });
      }
      
      return newPlaylist.length > 0;
  }


  const handleGeneratePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!request) return;

    if (!process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || !process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_YOUTUBE_API_KEY === 'YOUR_YOUTUBE_API_KEY') {
      toast({
        variant: 'destructive',
        title: "Configuration Missing",
        description: "Please add your YouTube API Key and Google Client ID to the .env.local file.",
      });
      return;
    }

    const history = getHistoryForAI();
    if (history === null) return;

    setIsLoading(true);
    setActiveView("playlist");
    setIsRadioMode(false); // User-requested playlist is not radio mode
    try {
      const response = await generatePlaylistAction(
        history,
        request
      );

      const playlistNames = response?.playlist;

      if (!playlistNames || !Array.isArray(playlistNames)) {
        toast({
            variant: "destructive",
            title: "Playlist Generation Failed",
            description: "The AI returned an invalid response. Please try again.",
        });
        throw new Error("Invalid playlist response from AI");
      }

      await processGeneratedPlaylist(playlistNames);

    } catch (error: any) {
      console.error(error);
      if (error.message.includes("Invalid playlist response from AI")) {
          // Toast is already shown
      } else {
        const errorMessage = error?.result?.error?.message || error?.message || "Could not generate a new playlist.";
         if (errorMessage.includes("503") || errorMessage.includes("overloaded")) {
          toast({
            variant: "destructive",
            title: "AI Model Overloaded",
            description: "The AI is currently busy. Please try again in a moment.",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Playlist Generation Failed",
            description: errorMessage,
          });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartRadio = async () => {
    if (!process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || !process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_YOUTUBE_API_KEY === 'YOUR_YOUTUBE_API_KEY') {
      toast({
        variant: 'destructive',
        title: "Configuration Missing",
        description: "Please add your YouTube API Key and Google Client ID to the .env.local file.",
      });
      return;
    }
    
    const history = getHistoryForAI();
    // For radio, we can proceed even with null/empty history
    if (history === null && isLoggedIn) return;

     if (!isLoggedIn) {
      toast({
        title: "Starting Radio",
        description: "Login with YouTube for a personalized radio experience.",
      });
    }

    const radioRequest = 'a radio mix based on my taste';
    setIsLoading(true);
    setActiveView("playlist");
    setIsRadioMode(true);
    try {
      const response = await generatePlaylistAction(
        history ?? "",
        radioRequest
      );
      
      const playlistNames = response?.playlist;

      if (!playlistNames || !Array.isArray(playlistNames)) {
        toast({
            variant: "destructive",
            title: "Radio Failed",
            description: "The AI returned an invalid response. Please try again.",
        });
        throw new Error("Invalid playlist response from AI");
      }

      const wasPlaylistCreated = await processGeneratedPlaylist(playlistNames);

      if (wasPlaylistCreated) {
        setCurrentSongIndex(0);
        setIsPlaying(true);
        setProgress(0);
      } else {
        setIsRadioMode(false);
      }

    } catch (error: any)
      {
      console.error(error);
      if (error.message.includes("Invalid playlist response from AI")) {
          // Toast is already shown
      } else {
        const errorMessage = error?.result?.error?.message || error?.message || "Could not generate radio playlist.";
         if (errorMessage.includes("503") || errorMessage.includes("overloaded")) {
          toast({
            variant: "destructive",
            title: "AI Model Overloaded",
            description: "The AI is currently busy. Please try again in a moment.",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Radio Failed",
            description: errorMessage,
          });
        }
      }
      setIsRadioMode(false);
    } finally {
      setIsLoading(false);
    }
  };

  const viewPlaylist = () => {
    setActiveView("playlist");
  };

  const handlePlayerProgress = (state: { played: number, playedSeconds: number, loaded: number, loadedSeconds: number }) => {
    setProgress(state.played * 100);
  }

   const handleLoginSuccess = async () => {
      setIsLoadingPlaylists(true);
      try {
        const playlistsResponse = await window.gapi.client.youtube.playlists.list({
          part: ['snippet', 'contentDetails'],
          mine: true,
          maxResults: 50,
        });

        const playlistsData = playlistsResponse.result.items || [];
        
        const likedMusic = playlistsData.find((p: any) => p.snippet?.title === 'Liked music' || p.id === 'LM') || null;
        const otherPlaylists = playlistsData.filter((p: any) => p.id !== 'LM' && p.snippet?.title !== 'Liked music');

        setLikedMusicPlaylist(likedMusic);
        setPlaylists(otherPlaylists);

        // This uses the videos.list with myRating='like' which is the correct way to get liked videos.
        const likedVideosResponse = await window.gapi.client.youtube.videos.list({
          part: ['snippet', 'contentDetails'],
          myRating: 'like',
          maxResults: 50, // Limit to 50 to avoid rate limit issues.
        });
        
        const historyItems = likedVideosResponse.result.items || [];
        
        const history = historyItems.map((item: any) => ({
          title: item.snippet?.title || 'Unknown Title',
          artist: (item.snippet?.channelTitle || 'Unknown Artist').replace(/ - Topic$/, ''),
        }));

        setListeningHistory(history);

        if (history.length > 0) {
          toast({
            title: "Taste Profile Updated!",
            description: `Analyzed your ${history.length} most recently liked songs.`
          });
        } else {
            toast({
            title: "Taste Profile Empty",
            description: "We couldn't find your liked songs. Like some songs on YouTube Music to build your profile!"
          });
        }
      } catch (e: any) {
        console.error(e);
        const errorMessage = e.result?.error?.message || e.message || "Could not fetch your YouTube data.";
        if (errorMessage.includes('quotaExceeded')) {
            toast({
                variant: "destructive",
                title: "YouTube API Quota Exceeded",
                description: "You've hit the daily limit for YouTube API requests. Please try again tomorrow.",
            });
        } else {
            toast({
                variant: "destructive",
                title: "Error fetching YouTube data",
                description: errorMessage
            });
        }
      } finally {
        setIsLoadingPlaylists(false);
      }
  };
  
    const handleLogout = () => {
        try {
            const tokenStr = localStorage.getItem('gapi_token');
            if (tokenStr) {
                const token = JSON.parse(tokenStr);
                if (token && token.access_token) {
                    window.google.accounts.oauth2.revoke(token.access_token, () => {});
                }
            }
        } catch(e) {
            console.error("Error parsing or revoking token", e);
        }
        
        window.gapi.client.setToken(null);
        setIsLoggedIn(false);
        clearYouTubeData();
        // Reset local state
        setPlaylist([]);
        setCurrentSongIndex(null);
        setAnalysisResult(null);
        
        toast({ title: "Logged out." });
    }

    const openAddToPlaylist = (song: Song) => {
        if (!isLoggedIn) {
            toast({ variant: 'destructive', title: 'Login Required', description: 'Please log in to add songs to a playlist.' });
            return;
        }
        setSongToAdd(song);
        setIsAddToPlaylistOpen(true);
    };

    const handleAddSongToPlaylist = async (playlistId: string) => {
        if (!songToAdd) return;
        try {
            await window.gapi.client.youtube.playlistItems.insert({
                part: ['snippet'],
                resource: {
                    snippet: {
                        playlistId: playlistId,
                        resourceId: {
                            kind: 'youtube#video',
                            videoId: songToAdd.videoId,
                        },
                    },
                },
            });
            toast({ title: 'Song Added', description: `"${songToAdd.title}" has been added.` });
        } catch (error: any) {
            console.error('Error adding song to playlist:', error);
            toast({ variant: 'destructive', title: 'Error', description: error.result?.error?.message || 'Could not add song.' });
        } finally {
            setIsAddToPlaylistOpen(false);
            setSongToAdd(null);
        }
    };
    
    const openCreatePlaylist = () => {
        if (!isLoggedIn) {
            toast({ variant: 'destructive', title: 'Login Required', description: 'Please log in to create a playlist.' });
            return;
        }
        setIsCreatePlaylistOpen(true);
    };

    const handleCreatePlaylist = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPlaylistName) return;
        setIsCreatingPlaylist(true);
        try {
            const response = await window.gapi.client.youtube.playlists.insert({
                part: ['snippet', 'status'],
                resource: {
                    snippet: {
                        title: newPlaylistName,
                        description: 'Created with R3 Playback',
                    },
                    status: {
                        privacyStatus: 'public',
                    },
                },
            });
            setPlaylists([response.result, ...playlists]);
            toast({ title: 'Playlist Created', description: `"${newPlaylistName}" has been created.` });
        } catch (error: any) {
            console.error('Error creating playlist:', error);
            toast({ variant: 'destructive', title: 'Error', description: error.result?.error?.message || 'Could not create playlist.' });
        } finally {
            setIsCreatePlaylistOpen(false);
            setNewPlaylistName("");
            setIsCreatingPlaylist(false);
        }
    };


  return (
    <SidebarProvider>
      <div className="bg-background min-h-svh">
        <NeonTuneSidebar
          onAnalyze={handleAnalyzeHistory}
          onViewPlaylist={viewPlaylist}
          onStartRadio={handleStartRadio}
          onLoginSuccess={handleLoginSuccess}
          onCreatePlaylist={openCreatePlaylist}
        />
        <SidebarInset>
          <div className="flex flex-col h-full max-h-svh overflow-hidden">
            <header className="flex h-16 items-center justify-center border-b px-4 shrink-0">
              <div className="flex items-center gap-4 w-full max-w-screen-xl mx-auto">
                <SidebarTrigger className="md:hidden" />
                <div className="flex items-center gap-2">
                  <Music className="w-6 h-6 text-primary icon-glow" />
                  <h1 className="text-xl font-headline font-bold">
                    R3 Playback
                  </h1>
                </div>
                <div className="flex-1" />
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <User className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {isLoggedIn ? (
                        <DropdownMenuItem onClick={handleLogout}>
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Log out</span>
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuLabel className="font-normal text-muted-foreground">
                          Not logged in.
                        </DropdownMenuLabel>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </header>
            
            <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-[160px] md:pb-[90px]">
              <div className="w-full max-w-screen-xl mx-auto">
                <Card className="mb-6 bg-card border-border shadow-lg shadow-primary/10">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-6 h-6 text-primary" />
                      <CardTitle className="font-headline text-2xl">
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
                      className="flex flex-col sm:flex-row gap-2"
                    >
                      <Input
                        placeholder="e.g., '90s rock classics' or 'upbeat electronic'"
                        value={request}
                        onChange={(e) => setRequest(e.target.value)}
                        className="text-base"
                        disabled={isLoading}
                      />
                      <Button type="submit" disabled={isLoading} size="lg" className="font-bold gap-2">
                        {isLoading ? (
                          <Loader className="animate-spin" />
                        ) : (
                          <Mic />
                        )}
                        <span className="sm:inline">Request</span>
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
                  onAddToPlaylist={openAddToPlaylist}
                />
              </div>
            </main>

            {currentSong && (
              <Player
                song={currentSong}
                isPlaying={isPlaying}
                progress={progress}
                onPlayPause={handlePlayPause}
                onNext={handleNext}
                onPrev={handlePrev}
                onProgressChange={handlePlayerProgress}
                onEnded={handleNext}
                onOpenFullScreen={() => setIsFullScreenPlayer(true)}
              />
            )}
            
            {currentSong && isFullScreenPlayer && (
                <FullScreenPlayer
                    song={currentSong}
                    isPlaying={isPlaying}
                    progress={progress}
                    onPlayPause={handlePlayPause}
                    onNext={handleNext}
                    onPrev={handlePrev}
                    onProgressChange={handlePlayerProgress}
                    onEnded={handleNext}
                    onClose={() => setIsFullScreenPlayer(false)}
                    onAddToPlaylist={openAddToPlaylist}
                />
            )}
          </div>
        </SidebarInset>
      </div>

       <Dialog open={isAddToPlaylistOpen} onOpenChange={setIsAddToPlaylistOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to Playlist</DialogTitle>
            <DialogDescription>
              Select a playlist to add &quot;{songToAdd?.title}&quot; to.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-64">
            <div className="flex flex-col gap-2 p-1">
              {[likedMusicPlaylist, ...playlists]
                .filter(p => p != null && p.snippet)
                .map((p: any) => (
                  <Button
                    key={p.id}
                    variant="ghost"
                    className="justify-start gap-3"
                    onClick={() => handleAddSongToPlaylist(p.id)}
                  >
                    {p.id === 'LM' ? <ThumbsUp className="w-4 h-4 text-primary" /> : <ListMusic className="w-4 h-4 text-muted-foreground" />}
                    <span>{p.snippet.title}</span>
                  </Button>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isCreatePlaylistOpen} onOpenChange={setIsCreatePlaylistOpen}>
        <DialogContent>
            <form onSubmit={handleCreatePlaylist}>
          <DialogHeader>
            <DialogTitle>Create New Playlist</DialogTitle>
          </DialogHeader>
          <div className="py-4">
             <Input
                placeholder="My Awesome Playlist"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                disabled={isCreatingPlaylist}
              />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setIsCreatePlaylistOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isCreatingPlaylist}>
                {isCreatingPlaylist ? <Loader className="animate-spin mr-2" /> : <Plus className="mr-2" />}
                Create
            </Button>
          </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
