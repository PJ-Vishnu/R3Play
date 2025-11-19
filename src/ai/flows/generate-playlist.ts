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
    .describe('The user listening history, as a string. This can be empty if no history is available.'),
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
  prompt: `You are a personal DJ that generates playlists based on a user's taste and current song requests.

  Current Requests: {{{currentRequests}}}
  
  {{#if listeningHistory}}
  The user's listening history is provided below. Use it as a strong indicator of their taste.
  Listening History: {{{listeningHistory}}}
  {{else}}
  No listening history is available. For a "radio" request, generate a playlist of popular and critically acclaimed songs from various genres. For a specific request (e.g., '90s rock'), generate a playlist based on that request.
  {{/if}}

Please create a playlist of 20 songs that the user will enjoy.  Respond with an array of song names, with each song formatted as 'Song Name by Artist Name'.`,
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
