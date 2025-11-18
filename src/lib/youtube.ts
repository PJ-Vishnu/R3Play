
import type { YouTubeVideoDetails } from './types';
import { parse as parseISO8601Duration } from 'iso8601-duration';

export async function searchSongOnYouTube(songTitle: string, artist: string): Promise<string | null> {
    if (!window.gapi || !window.gapi.client || !window.gapi.client.youtube) {
        console.error("YouTube API client is not initialized.");
        return null;
    }

    try {
        const response = await window.gapi.client.youtube.search.list({
            part: 'snippet',
            q: `${songTitle} ${artist}`,
            type: 'video',
            videoCategoryId: '10', // Music category
            maxResults: 1,
        });

        if (response.result.items && response.result.items.length > 0 && response.result.items[0].id) {
            return response.result.items[0].id.videoId;
        }
        return null;
    } catch (error: any) {
        const errorMessage = error?.result?.error?.message || error?.message || JSON.stringify(error);
        console.error("Error searching on YouTube:", errorMessage);
        return null;
    }
}


export async function getMyPlaylists(): Promise<any[]> {
    if (!window.gapi || !window.gapi.client || !window.gapi.client.youtube) {
        console.error("YouTube API client is not initialized.");
        return [];
    }

    try {
        const response = await window.gapi.client.youtube.playlists.list({
            part: 'snippet,contentDetails',
            mine: true,
            maxResults: 50, // Fetch up to 50 playlists
        });

        return response.result.items || [];
    } catch (error: any) {
        const errorMessage = error?.result?.error?.message || error?.message || JSON.stringify(error);
        console.error("Error fetching playlists:", errorMessage);
        return [];
    }
}

function convertISO8601ToSeconds(isoDuration: string): number {
    try {
        const duration = parseISO8601Duration(isoDuration);
        let seconds = 0;
        if (duration.hours) seconds += duration.hours * 3600;
        if (duration.minutes) seconds += duration.minutes * 60;
        if (duration.seconds) seconds += duration.seconds;
        return seconds;
    } catch (e) {
        console.error("Error parsing ISO8601 duration:", e);
        return 0;
    }
}

export async function getYouTubeVideoDetails(videoId: string): Promise<YouTubeVideoDetails | null> {
    if (!window.gapi || !window.gapi.client || !window.gapi.client.youtube) {
        console.error("YouTube API client is not initialized.");
        return null;
    }

    try {
        const response = await window.gapi.client.youtube.videos.list({
            part: 'snippet,contentDetails',
            id: videoId,
        });

        if (response.result.items && response.result.items.length > 0) {
            const item = response.result.items[0];
            const durationInSeconds = item.contentDetails?.duration ? convertISO8601ToSeconds(item.contentDetails.duration) : 0;
            
            // Find the best available thumbnail
            const thumbnails = item.snippet?.thumbnails;
            const thumbnailUrl = thumbnails?.maxres?.url || thumbnails?.high?.url || thumbnails?.medium?.url || thumbnails?.default?.url || '';

            return {
                duration: durationInSeconds,
                thumbnailUrl: thumbnailUrl,
            };
        }
        return null;
    } catch (error: any) {
        const errorMessage = error?.result?.error?.message || error?.message || JSON.stringify(error);
        console.error("Error fetching video details:", errorMessage);
        return null;
    }
}

    