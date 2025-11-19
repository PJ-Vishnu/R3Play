
"use server";

import {
  analyzeListeningHistory,
  type AnalyzeListeningHistoryOutput,
} from "@/ai/flows/analyze-listening-history";
import {
  generatePlaylist,
  type GeneratePlaylistOutput,
} from "@/ai/flows/generate-playlist";

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
    
