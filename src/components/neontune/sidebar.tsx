
"use client";

import {
  Home,
  Library,
  ListMusic,
  Plus,
  Radio,
  Sparkles,
  ThumbsUp,
} from "lucide-react";
import {
  Sidebar,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Button } from "../ui/button";
import YouTubeLogin from "./youtube-login";
import { useYouTube } from "@/context/youtube-context";
import { Skeleton } from "../ui/skeleton";


type NeonTuneSidebarProps = {
  onAnalyze: () => void;
  onViewPlaylist: () => void;
  onStartRadio: () => void;
  onLoginSuccess: (code: string) => void;
};

export default function NeonTuneSidebar({
  onAnalyze,
  onViewPlaylist,
  onStartRadio,
  onLoginSuccess,
}: NeonTuneSidebarProps) {
  const { isLoggedIn, playlists, isLoadingPlaylists, likedMusicPlaylist } = useYouTube();
  return (
    <Sidebar
      className="bg-sidebar-background"
      collapsible="icon"
      variant="sidebar"
    >
      <SidebarGroup>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Home" isActive>
              <Home className="text-primary icon-glow" />
              <span className="font-headline">Home</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Radio" onClick={onStartRadio}>
              <Radio />
              <span>Radio</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Library">
              <Library />
              <span>Library</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
      <SidebarSeparator />
      <SidebarGroup>
        <SidebarGroupLabel className="flex items-center justify-between">
          <span>AI Features</span>
          <Sparkles className="h-4 w-4 text-primary" />
        </SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={onAnalyze} tooltip="Analyze Taste">
              <Sparkles className="text-primary icon-glow" />
              <span>Analyze Taste</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={onViewPlaylist} tooltip="Current Playlist">
              <ListMusic className="text-primary icon-glow" />
              <span>Current Playlist</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
      <SidebarSeparator />
      <SidebarGroup className="flex-1 overflow-y-auto">
        <SidebarGroupLabel className="flex items-center justify-between">
          Playlists
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <Plus className="h-4 w-4" />
          </Button>
        </SidebarGroupLabel>
        <SidebarMenu>
          {isLoggedIn && isLoadingPlaylists && (
            <>
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </>
          )}
          {isLoggedIn && !isLoadingPlaylists && (
            <>
            {likedMusicPlaylist && (
              <SidebarMenuItem key={likedMusicPlaylist.id}>
                <SidebarMenuButton>
                   <ThumbsUp className="w-4 h-4 text-primary" />
                  <span>{likedMusicPlaylist.snippet?.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
            {playlists.map((playlist) => (
              <SidebarMenuItem key={playlist.id}>
                <SidebarMenuButton>
                  <span>{playlist.snippet?.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
            </>
          )}
        </SidebarMenu>
      </SidebarGroup>
       <SidebarSeparator />
      <SidebarGroup>
        <SidebarMenu>
          <YouTubeLogin onLoginSuccess={onLoginSuccess} />
        </SidebarMenu>
      </SidebarGroup>
    </Sidebar>
  );
}
