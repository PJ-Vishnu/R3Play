
"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface ListeningHistoryItem {
  title: string;
  artist: string;
}

interface YouTubeContextType {
    isLoggedIn: boolean;
    setIsLoggedIn: (isLoggedIn: boolean) => void;
    playlists: any[];
    setPlaylists: (playlists: any[]) => void;
    likedMusicPlaylist: any | null;
    setLikedMusicPlaylist: (playlist: any | null) => void;
    isLoadingPlaylists: boolean;
    setIsLoadingPlaylists: (isLoading: boolean) => void;
    listeningHistory: ListeningHistoryItem[];
    setListeningHistory: (history: ListeningHistoryItem[]) => void;
    clearYouTubeData: () => void;
}

const YouTubeContext = createContext<YouTubeContextType | undefined>(undefined);

export const YouTubeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [playlists, setPlaylists] = useState<any[]>([]);
    const [likedMusicPlaylist, setLikedMusicPlaylist] = useState<any | null>(null);
    const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(true); // Start as true
    const [listeningHistory, setListeningHistory] = useState<ListeningHistoryItem[]>([]);
    
    const clearYouTubeData = useCallback(() => {
        setPlaylists([]);
        setLikedMusicPlaylist(null);
        setListeningHistory([]);
        localStorage.removeItem('yt-playlists');
        localStorage.removeItem('yt-likedMusicPlaylist');
        localStorage.removeItem('yt-listeningHistory');
        localStorage.removeItem('yt-analysisResult');
        localStorage.removeItem('gapi_token');
    }, []);

    useEffect(() => {
        try {
            const storedPlaylists = localStorage.getItem('yt-playlists');
            const storedLikedMusic = localStorage.getItem('yt-likedMusicPlaylist');
            const storedHistory = localStorage.getItem('yt-listeningHistory');

            if (isLoggedIn) {
                if (storedPlaylists) setPlaylists(JSON.parse(storedPlaylists));
                if (storedLikedMusic) setLikedMusicPlaylist(JSON.parse(storedLikedMusic));
                if (storedHistory) setListeningHistory(JSON.parse(storedHistory));
            }

        } catch (error) {
            console.error("Failed to parse data from localStorage", error);
            clearYouTubeData();
        } finally {
            setIsLoadingPlaylists(false);
        }
    }, [isLoggedIn, clearYouTubeData]);


    const handleSetPlaylists = (data: any[]) => {
        setPlaylists(data);
        localStorage.setItem('yt-playlists', JSON.stringify(data));
    };

    const handleSetLikedMusicPlaylist = (data: any | null) => {
        setLikedMusicPlaylist(data);
        localStorage.setItem('yt-likedMusicPlaylist', JSON.stringify(data));
    };

    const handleSetListeningHistory = (data: ListeningHistoryItem[]) => {
        setListeningHistory(data);
        localStorage.setItem('yt-listeningHistory', JSON.stringify(data));
    };


    return (
        <YouTubeContext.Provider value={{
            isLoggedIn,
            setIsLoggedIn,
            playlists,
            setPlaylists: handleSetPlaylists,
            likedMusicPlaylist,
            setLikedMusicPlaylist: handleSetLikedMusicPlaylist,
            isLoadingPlaylists,
            setIsLoadingPlaylists,
            listeningHistory,
            setListeningHistory: handleSetListeningHistory,
            clearYouTubeData
        }}>
            {children}
        </YouTubeContext.Provider>
    );
};

export const useYouTube = () => {
    const context = useContext(YouTubeContext);
    if (context === undefined) {
        throw new Error('useYouTube must be used within a YouTubeProvider');
    }
    return context;
};
