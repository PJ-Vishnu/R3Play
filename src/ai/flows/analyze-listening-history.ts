'use server';

/**
 * @fileOverview Analyzes the user's YouTube Music listening history to build a detailed profile of their music tastes.
 *
 * - analyzeListeningHistory - A function that handles the analysis of the user's listening history.
 * - AnalyzeListeningHistoryInput - The input type for the analyzeListeningHistory function.
 * - AnalyzeListeningHistoryOutput - The return type for the analyzeListeningHistory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeListeningHistoryInputSchema = z.object({
  listeningHistory: z
    .string()
    .describe("A stringified JSON array containing the user's YouTube Music listening history. Each element should include song title, artist, and timestamp."),
});
export type AnalyzeListeningHistoryInput = z.infer<typeof AnalyzeListeningHistoryInputSchema>;

const AnalyzeListeningHistoryOutputSchema = z.object({
  genrePreferences: z.array(z.string()).describe('An array of the user’s preferred music genres, extracted from the listening history.'),
  artistPreferences: z.array(z.string()).describe('An array of the user’s preferred artists, extracted from the listening history.'),
  songPreferences: z.array(z.string()).describe('An array of the user’s preferred songs, extracted from the listening history.'),
  overallTasteProfile: z.string().describe('A summary of the user’s overall music taste profile.'),
});
export type AnalyzeListeningHistoryOutput = z.infer<typeof AnalyzeListeningHistoryOutputSchema>;

export async function analyzeListeningHistory(input: AnalyzeListeningHistoryInput): Promise<AnalyzeListeningHistoryOutput> {
  return analyzeListeningHistoryFlow(input);
}

const analyzeListeningHistoryPrompt = ai.definePrompt({
  name: 'analyzeListeningHistoryPrompt',
  input: {schema: AnalyzeListeningHistoryInputSchema},
  output: {schema: AnalyzeListeningHistoryOutputSchema},
  prompt: `You are an expert music analyst. Analyze the user's YouTube Music listening history to determine their music preferences. Extract genre, artist, and song preferences, and create an overall taste profile.

Listening History: {{{listeningHistory}}}

Output the preferences as JSON arrays of strings, and the overall taste profile as a string.

Make sure to include a wide variety of genres, artists and songs if they exist in the listening history. Be as comprehensive as possible.
`,
});

const analyzeListeningHistoryFlow = ai.defineFlow(
  {
    name: 'analyzeListeningHistoryFlow',
    inputSchema: AnalyzeListeningHistoryInputSchema,
    outputSchema: AnalyzeListeningHistoryOutputSchema,
  },
  async input => {
    const {output} = await analyzeListeningHistoryPrompt(input);
    return output!;
  }
);
