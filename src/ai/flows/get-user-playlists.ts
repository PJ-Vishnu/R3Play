'use server';
/**
 * @fileOverview A flow to fetch a user's YouTube playlists and listening history.
 *
 * - getUserPlaylists - A function that fetches YouTube data.
 * - GetUserPlaylistsInput - The input type for the getUserPlaylists function.
 * - GetUserPlaylistsOutput - The return type for the getUserPlaylists function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

const GetUserPlaylistsInputSchema = z.object({
  code: z.string().describe('The authorization code from the client.'),
});
export type GetUserPlaylistsInput = z.infer<typeof GetUserPlaylistsInputSchema>;

const PlaylistSchema = z.object({
  id: z.string(),
  snippet: z.object({
    title: z.string(),
  }).optional(),
}).optional();

const ListeningHistoryItemSchema = z.object({
  title: z.string(),
  artist: z.string(),
});

const GetUserPlaylistsOutputSchema = z.object({
  likedMusicPlaylist: PlaylistSchema.nullable(),
  otherPlaylists: z.array(PlaylistSchema),
  listeningHistory: z.array(ListeningHistoryItemSchema).nullable(),
});
export type GetUserPlaylistsOutput = z.infer<
  typeof GetUserPlaylistsOutputSchema
>;

export async function getUserPlaylists(
  input: GetUserPlaylistsInput
): Promise<GetUserPlaylistsOutput> {
  return getUserPlaylistsFlow(input);
}

const getUserPlaylistsFlow = ai.defineFlow(
  {
    name: 'getUserPlaylistsFlow',
    inputSchema: GetUserPlaylistsInputSchema,
    outputSchema: GetUserPlaylistsOutputSchema,
  },
  async ({ code }) => {
    const oauth2Client = new OAuth2Client({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: 'postmessage',
    });

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const youtube = google.youtube({
      version: 'v3',
      auth: oauth2Client,
    });

    const playlistsResponse = await youtube.playlists.list({
      part: ['snippet', 'contentDetails'],
      mine: true,
      maxResults: 50,
    });

    const playlists = playlistsResponse.data.items || [];
    const likedMusicPlaylist = playlists.find((p: any) => p.id === 'LM') || null;
    const otherPlaylists = playlists.filter((p: any) => p.id !== 'LM');

    let listeningHistory = null;

    if (likedMusicPlaylist) {
      let allItems: any[] = [];
      let nextPageToken: string | undefined | null = undefined;

      do {
        const playlistItemsResponse = await youtube.playlistItems.list({
          part: ['snippet', 'contentDetails'],
          playlistId: likedMusicPlaylist.id!,
          maxResults: 50,
          pageToken: nextPageToken || undefined,
        });
        
        allItems = allItems.concat(playlistItemsResponse.data.items || []);
        nextPageToken = playlistItemsResponse.data.nextPageToken;

      } while (nextPageToken);

      listeningHistory = allItems.map((item) => ({
        title: item.snippet?.title || 'Unknown Title',
        artist: (item.snippet?.videoOwnerChannelTitle || 'Unknown Artist').replace(
          ' - Topic',
          ''
        ),
      }));
    }

    return {
      likedMusicPlaylist,
      otherPlaylists,
      listeningHistory,
    };
  }
);
