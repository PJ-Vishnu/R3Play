"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Youtube } from "lucide-react";
import { SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { useToast } from '@/hooks/use-toast';

const YouTubeLogin: React.FC = () => {
    const [tokenClient, setTokenClient] = useState<any>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isGapiLoaded, setIsGapiLoaded] = useState(false);
    const { toast } = useToast();

    const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    const loadGapi = useCallback(() => {
        if (window.gapi) {
            window.gapi.load('client', () => {
                if (!apiKey || apiKey === "YOUR_YOUTUBE_API_KEY") {
                    console.error("YouTube API Key is missing.");
                    return;
                }
                window.gapi.client.init({
                    apiKey: apiKey,
                    discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest'],
                }).then(() => {
                    setIsGapiLoaded(true);
                });
            });
        }
    }, [apiKey]);

    const loadGsi = useCallback(() => {
        if (window.google) {
             if (!clientId || clientId === "YOUR_GOOGLE_CLIENT_ID") {
                console.error("Google Client ID is missing.");
                return;
            }
            const client = window.google.accounts.oauth2.initTokenClient({
                client_id: clientId,
                scope: 'https://www.googleapis.com/auth/youtube.readonly',
                callback: (tokenResponse) => {
                    if (tokenResponse && tokenResponse.access_token) {
                        window.gapi.client.setToken(tokenResponse);
                        setIsLoggedIn(true);
                        toast({ title: "Successfully logged into YouTube Music." });
                    }
                },
            });
            setTokenClient(client);
        }
    }, [toast, clientId]);
    
    useEffect(() => {
        if (typeof window !== 'undefined') {
            loadGapi();
            loadGsi();
        }
    }, [loadGapi, loadGsi]);

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
        const token = window.gapi.client.getToken();
        if (token) {
            window.google.accounts.oauth2.revoke(token.access_token, () => {
                window.gapi.client.setToken(null);
                setIsLoggedIn(false);
                toast({ title: "Logged out from YouTube Music." });
            });
        }
    }

    return (
        <SidebarMenuItem>
            <SidebarMenuButton onClick={isLoggedIn ? handleLogout : handleLogin} disabled={!isGapiLoaded && !isLoggedIn}>
              <Youtube className="text-red-500" />
              <span>{isLoggedIn ? "Logout from YouTube Music" : "Login with YouTube Music"}</span>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
};

export default YouTubeLogin;
