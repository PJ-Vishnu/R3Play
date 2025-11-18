
"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';

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
    clearPlaylists: () => void;
}

const YouTubeContext = createContext<YouTubeContextType | undefined>(undefined);

export const YouTubeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [playlists, setPlaylists] = useState<any[]>([]);
    const [likedMusicPlaylist, setLikedMusicPlaylist] = useState<any | null>(null);
    const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(false);
    const [listeningHistory, setListeningHistory] = useState<ListeningHistoryItem[]>([]);

    const clearPlaylists = useCallback(() => {
        setPlaylists([]);
        setLikedMusicPlaylist(null);
        setListeningHistory([]);
    }, []);

    return (
        <YouTubeContext.Provider value={{
            isLoggedIn,
            setIsLoggedIn,
            playlists,
            setPlaylists,
            likedMusicPlaylist,
            setLikedMusicPlaylist,
            isLoadingPlaylists,
            setIsLoadingPlaylists,
            listeningHistory,
            setListeningHistory,
            clearPlaylists
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
