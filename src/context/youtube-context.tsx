
"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { getMyPlaylists } from '@/lib/youtube';

interface YouTubeContextType {
    isLoggedIn: boolean;
    setIsLoggedIn: (isLoggedIn: boolean) => void;
    playlists: any[];
    likedMusicPlaylist: any | null;
    isLoadingPlaylists: boolean;
    fetchPlaylists: () => Promise<void>;
    clearPlaylists: () => void;
}

const YouTubeContext = createContext<YouTubeContextType | undefined>(undefined);

export const YouTubeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [playlists, setPlaylists] = useState<any[]>([]);
    const [likedMusicPlaylist, setLikedMusicPlaylist] = useState<any | null>(null);
    const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(false);

    const fetchPlaylists = useCallback(async () => {
        if (!isLoggedIn) return;
        setIsLoadingPlaylists(true);
        try {
            const items = await getMyPlaylists();
            // "Liked music" is a special playlist channel, often with id 'LM'
            const liked = items.find(p => p.id === 'LM');
            const otherPlaylists = items.filter(p => p.id !== 'LM');
            
            setLikedMusicPlaylist(liked || null);
            setPlaylists(otherPlaylists);
        } catch (error) {
            console.error("Failed to fetch playlists", error);
            setPlaylists([]);
            setLikedMusicPlaylist(null);
        } finally {
            setIsLoadingPlaylists(false);
        }
    }, [isLoggedIn]);

    const clearPlaylists = useCallback(() => {
        setPlaylists([]);
        setLikedMusicPlaylist(null);
    }, []);

    return (
        <YouTubeContext.Provider value={{
            isLoggedIn,
            setIsLoggedIn,
            playlists,
            likedMusicPlaylist,
            isLoadingPlaylists,
            fetchPlaylists,
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
