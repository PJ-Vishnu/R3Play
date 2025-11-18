"use server";

import {
  analyzeListeningHistory,
  type AnalyzeListeningHistoryOutput,
} from "@/ai/flows/analyze-listening-history";
import {
  generatePlaylist,
  type GeneratePlaylistOutput,
} from "@/ai/flows/generate-playlist";
import {
  getUserPlaylists,
  type GetUserPlaylistsOutput,
} from "@/ai/flows/get-user-playlists";

export async function analyzeHistoryAction(
  listeningHistory: string
): Promise<AnalyzeListeningHistoryOutput> {
  const result = await analyzeListeningHistory({ listeningHistory });
  return result;
}

export async function generatePlaylistAction(
  listeningHistory: string,
  currentRequests: string
): Promise<GeneratePlaylistOutput> {
  const result = await generatePlaylist({ listeningHistory, currentRequests });
  return result;
}

export async function getUserPlaylistsAction(
  code: string
): Promise<GetUserPlaylistsOutput> {
  const result = await getUserPlaylists({ code });
  return result;
}
