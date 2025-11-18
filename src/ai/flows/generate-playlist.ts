'use server';
/**
 * @fileOverview A personalized playlist generation AI agent.
 *
 * - generatePlaylist - A function that generates a personalized playlist.
 * - GeneratePlaylistInput - The input type for the generatePlaylist function.
 * - GeneratePlaylistOutput - The return type for the generatePlaylist function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePlaylistInputSchema = z.object({
  listeningHistory: z
    .string()
    .describe('The user listening history, as a string.'),
  currentRequests: z
    .string()
    .describe('The current song requests, as a string.'),
});
export type GeneratePlaylistInput = z.infer<typeof GeneratePlaylistInputSchema>;

const GeneratePlaylistOutputSchema = z.object({
  playlist: z.array(z.string().describe("A song name and artist, in the format 'Song Name by Artist Name'")).describe('A list of song names for the playlist.'),
});
export type GeneratePlaylistOutput = z.infer<typeof GeneratePlaylistOutputSchema>;

export async function generatePlaylist(input: GeneratePlaylistInput): Promise<GeneratePlaylistOutput> {
  return generatePlaylistFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePlaylistPrompt',
  input: {schema: GeneratePlaylistInputSchema},
  output: {schema: GeneratePlaylistOutputSchema},
  prompt: `You are a personal DJ that generates playlists based on listening history and current song requests.

  Listening History: {{{listeningHistory}}}
  Current Requests: {{{currentRequests}}}

Please create a playlist of songs that the user will enjoy.  Respond with an array of song names, with each song formatted as 'Song Name by Artist Name'.  Make sure the songs are appropriate for the listening history and current requests.`,
});

const generatePlaylistFlow = ai.defineFlow(
  {
    name: 'generatePlaylistFlow',
    inputSchema: GeneratePlaylistInputSchema,
    outputSchema: GeneratePlaylistOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
