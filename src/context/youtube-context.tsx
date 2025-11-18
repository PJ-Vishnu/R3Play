
"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';

interface YouTubeContextType {
    isLoggedIn: boolean;
    setIsLoggedIn: (isLoggedIn: boolean) => void;
    playlists: any[];
    setPlaylists: (playlists: any[]) => void;
    likedMusicPlaylist: any | null;
    setLikedMusicPlaylist: (playlist: any | null) => void;
    isLoadingPlaylists: boolean;
    setIsLoadingPlaylists: (isLoading: boolean) => void;
    clearPlaylists: () => void;
}

const YouTubeContext = createContext<YouTubeContextType | undefined>(undefined);

export const YouTubeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [playlists, setPlaylists] = useState<any[]>([]);
    const [likedMusicPlaylist, setLikedMusicPlaylist] = useState<any | null>(null);
    const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(false);

    const clearPlaylists = useCallback(() => {
        setPlaylists([]);
        setLikedMusicPlaylist(null);
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

    