
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { LogOut, Youtube } from "lucide-react";
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
    const { toast } = useToast();
    const { isLoggedIn, setIsLoggedIn, clearPlaylists } = useYouTube();

    const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    const gapiLoaded = useCallback(() => {
        if (!apiKey || apiKey === "YOUR_YOUTUBE_API_KEY") {
            console.warn("YouTube API Key is missing.");
            return;
        }
        window.gapi.load('client', async () => {
            await window.gapi.client.init({
                apiKey: apiKey,
                discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest'],
            });
            setIsReady(true);
        });
    }, [apiKey]);

    const gsiLoaded = useCallback(() => {
         if (!clientId || clientId === "YOUR_GOOGLE_CLIENT_ID") {
            console.warn("Google Client ID is missing.");
            return;
        }
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: clientId,
            scope: 'https://www.googleapis.com/auth/youtube.readonly',
            callback: (tokenResponse: any) => {
                if (tokenResponse.access_token) {
                    window.gapi.client.setToken(tokenResponse);
                    setIsLoggedIn(true);
                    onLoginSuccess();
                    toast({ title: "Successfully logged into YouTube." });
                } else {
                    console.error("Access token not found in response", tokenResponse);
                    toast({ variant: "destructive", title: "Login Failed", description: "Could not retrieve access token." });
                }
            },
            error_callback: (error: any) => {
                console.error('GSI Error:', error);
                if (error.type !== 'popup_closed' && error.type !== 'popup_failed_to_open') {
                   toast({ variant: 'destructive', title: 'Login Error', description: error.message || 'An unknown error occurred during login.' });
                }
            }
        });
        (window as any).tokenClient = tokenClient;
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

        const tokenClient = (window as any).tokenClient;
        if (tokenClient) {
            tokenClient.requestAccessToken();
        } else {
            toast({ variant: 'destructive', title: 'Login Service Not Ready', description: 'Please wait a moment and try again.' });
        }
    };
    
    const handleLogout = () => {
        const token = window.gapi.client.getToken();
        if (token) {
            window.google.accounts.oauth2.revoke(token.access_token, () => {});
        }
        window.gapi.client.setToken(null);
        setIsLoggedIn(false);
        clearPlaylists();
        toast({ title: "Logged out." });
    }

    if (!isLoggedIn) {
        return (
            <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogin} disabled={!isReady}>
                <Youtube className="text-red-500" />
                <span>Login with YouTube</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
        );
    }

    return null;
};

export default YouTubeLogin;
