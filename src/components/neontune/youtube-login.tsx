
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

    useEffect(() => {
        const gapiScript = document.createElement('script');
        gapiScript.src = 'https://apis.google.com/js/api.js';
        gapiScript.async = true;
        gapiScript.defer = true;
        gapiScript.onload = () => window.gapi.load('client', initGapiClient);
        document.body.appendChild(gapiScript);

        const gsiScript = document.createElement('script');
        gsiScript.src = 'https://accounts.google.com/gsi/client';
        gsiScript.async = true;
        gsiScript.defer = true;
        gsiScript.onload = initGsiClient;
        document.body.appendChild(gsiScript);

        return () => {
            document.body.removeChild(gapiScript);
            document.body.removeChild(gsiScript);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    
    const initGapiClient = useCallback(async () => {
        if (!apiKey || apiKey === "YOUR_YOUTUBE_API_KEY") {
            return;
        }
        await window.gapi.client.init({
            apiKey: apiKey,
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest'],
        });
        if(tokenClient) setIsReady(true);
    }, [apiKey, tokenClient]);

    const initGsiClient = useCallback(() => {
        if (!clientId || clientId === "YOUR_GOOGLE_CLIENT_ID") {
            return;
        }
        const client = window.google.accounts.oauth2.initTokenClient({
            client_id: clientId,
            scope: 'https://www.googleapis.com/auth/youtube.readonly',
            callback: (tokenResponse: any) => {
                if (tokenResponse.access_token) {
                    window.gapi.client.setToken(tokenResponse);
                    setIsLoggedIn(true);
                    onLoginSuccess();
                    toast({ title: "Successfully logged into YouTube Music." });
                } else {
                    console.error("Access token not found in response", tokenResponse);
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
        if(window.gapi?.client?.youtube) setIsReady(true);
    }, [clientId, onLoginSuccess, setIsLoggedIn, toast]);

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
        }
    };
    
    const handleLogout = () => {
        setIsLoggedIn(false);
        clearPlaylists();
        window.gapi.client.setToken(null);
        toast({ title: "Logged out." });
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
