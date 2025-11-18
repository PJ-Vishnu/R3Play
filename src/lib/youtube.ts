
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
