
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Youtube } from "lucide-react";
import { SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { useToast } from '@/hooks/use-toast';
import { useYouTube } from '@/context/youtube-context';

declare global {
    interface Window {
        gapi: any;
        google: any;
    }
}

interface YouTubeLoginProps {
    onLoginSuccess: () => void;
}

const YouTubeLogin: React.FC<YouTubeLoginProps> = ({ onLoginSuccess }) => {
    const [isReady, setIsReady] = useState(false);
    const [tokenClient, setTokenClient] = useState<any>(null);
    const { toast } = useToast();
    const { isLoggedIn, setIsLoggedIn, clearPlaylists } = useYouTube();

    const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    const gapiLoaded = useCallback(() => {
        if (!apiKey || apiKey === "YOUR_YOUTUBE_API_KEY") {
            console.error("YouTube API Key is missing.");
            return;
        }
        window.gapi.load('client', async () => {
            await window.gapi.client.init({
                apiKey: apiKey,
                discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest'],
            });
            if (tokenClient) {
                setIsReady(true);
            }
        });
    }, [apiKey, tokenClient]);
    
    const gsiLoaded = useCallback(() => {
        if (!clientId || clientId === "YOUR_GOOGLE_CLIENT_ID") {
            console.error("Google Client ID is missing.");
            return;
        }
        try {
            const client = window.google.accounts.oauth2.initTokenClient({
                client_id: clientId,
                scope: 'https://www.googleapis.com/auth/youtube.readonly',
                callback: (tokenResponse: any) => {
                    if (tokenResponse && tokenResponse.access_token) {
                        window.gapi.client.setToken(tokenResponse);
                        setIsLoggedIn(true);
                        onLoginSuccess();
                        toast({ title: "Successfully logged into YouTube Music." });
                    } else {
                        console.error("Access token not found in tokenResponse", tokenResponse);
                        toast({ variant: "destructive", title: "Login Failed", description: "Could not retrieve access token." });
                    }
                },
                error_callback: (error: any) => {
                    console.error('GSI Error:', error);
                    if (error.type !== 'popup_closed') {
                       toast({ variant: 'destructive', title: 'Login Error', description: error.message || 'An unknown error occurred during login.' });
                    }
                }
            });
            setTokenClient(client);
            if (window.gapi?.client?.youtube) {
                setIsReady(true);
            }
        } catch (e) {
            console.error("Error initializing token client", e);
        }
    }, [clientId, onLoginSuccess, setIsLoggedIn, toast]);

    useEffect(() => {
        const gapiScript = document.createElement('script');
        gapiScript.src = 'https://apis.google.com/js/api.js';
        gapiScript.async = true;
        gapiScript.defer = true;
        gapiScript.onload = gapiLoaded;
        document.body.appendChild(gapiScript);

        const gsiScript = document.createElement('script');
        gsiScript.src = 'https://accounts.google.com/gsi/client';
        gsiScript.async = true;
        gsiScript.defer = true;
        gsiScript.onload = gsiLoaded;
        document.body.appendChild(gsiScript);

        return () => {
            document.body.removeChild(gapiScript);
            document.body.removeChild(gsiScript);
        };
    }, [gapiLoaded, gsiLoaded]);

    const handleLogin = () => {
        if (!apiKey || apiKey === "YOUR_YOUTUBE_API_KEY" || !clientId || clientId === "YOUR_GOOGLE_CLIENT_ID") {
            toast({
                variant: 'destructive',
                title: "Configuration Missing",
                description: "Please add your YouTube API Key and Google Client ID to the .env.local file.",
            });
            return;
        }

        if (tokenClient) {
            tokenClient.requestAccessToken();
        } else {
             toast({
                variant: 'destructive',
                title: "Login Service Not Ready",
                description: "The Google login service is still initializing. Please try again in a moment.",
            });
        }
    };
    
    const handleLogout = () => {
        const token = window.gapi?.client.getToken();
        if (token && window.google?.accounts?.oauth2) {
            window.google.accounts.oauth2.revoke(token.access_token, () => {
                window.gapi.client.setToken(null);
                setIsLoggedIn(false);
                clearPlaylists();
                toast({ title: "Logged out from YouTube Music." });
            });
        }
    }

    return (
        <SidebarMenuItem>
            <SidebarMenuButton onClick={isLoggedIn ? handleLogout : handleLogin} disabled={!isReady && !isLoggedIn}>
              <Youtube className="text-red-500" />
              <span>{isLoggedIn ? "Logout from YouTube" : "Login with YouTube"}</span>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
};

export default YouTubeLogin;
