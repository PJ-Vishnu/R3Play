
"use client";

import {
  Home,
  Library,
  ListMusic,
  Plus,
  Radio,
  Sparkles,
} from "lucide-react";
import { PLAYLISTS } from "@/lib/data";
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


type NeonTuneSidebarProps = {
  onAnalyze: () => void;
  onViewPlaylist: () => void;
};

export default function NeonTuneSidebar({
  onAnalyze,
  onViewPlaylist,
}: NeonTuneSidebarProps) {
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
            <SidebarMenuButton tooltip="Radio">
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
          {PLAYLISTS.map((playlist) => (
            <SidebarMenuItem key={playlist.id}>
              <SidebarMenuButton>
                <span>{playlist.name}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
       <SidebarSeparator />
      <SidebarGroup>
        <SidebarMenu>
          <YouTubeLogin />
        </SidebarMenu>
      </SidebarGroup>
    </Sidebar>
  );
}
