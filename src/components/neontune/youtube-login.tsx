
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
    onLoginSuccess: (code: string) => void;
}

const YouTubeLogin: React.FC<YouTubeLoginProps> = ({ onLoginSuccess }) => {
    const [isGapiReady, setIsGapiReady] = useState(false);
    const [isGsiReady, setIsGsiReady] = useState(false);
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
        gapiScript.onload = () => {
             if (!apiKey || apiKey === "YOUR_YOUTUBE_API_KEY") {
                console.error("YouTube API Key is missing.");
                return;
            }
            window.gapi.load('client', async () => {
                await window.gapi.client.init({
                    apiKey: apiKey,
                    discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest'],
                });
                setIsGapiReady(true);
            });
        };
        document.body.appendChild(gapiScript);

        const gsiScript = document.createElement('script');
        gsiScript.src = 'https://accounts.google.com/gsi/client';
        gsiScript.async = true;
        gsiScript.defer = true;
        gsiScript.onload = () => {
             if (!clientId || clientId === "YOUR_GOOGLE_CLIENT_ID") {
                console.error("Google Client ID is missing.");
                return;
            }
            const client = window.google.accounts.oauth2.initCodeClient({
                client_id: clientId,
                scope: 'https://www.googleapis.com/auth/youtube.readonly',
                ux_mode: 'popup',
                callback: (response: any) => {
                    if (response.code) {
                        setIsLoggedIn(true);
                        onLoginSuccess(response.code);
                        toast({ title: "Successfully logged into YouTube Music." });
                    } else {
                        console.error("Auth code not found in response", response);
                        toast({ variant: "destructive", title: "Login Failed", description: "Could not retrieve authorization code." });
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
            setIsGsiReady(true);
        };
        document.body.appendChild(gsiScript);

        return () => {
            document.body.removeChild(gapiScript);
            document.body.removeChild(gsiScript);
        };
    }, [apiKey, clientId, onLoginSuccess, setIsLoggedIn, toast]);

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
            tokenClient.requestCode();
        } else {
             toast({
                variant: 'destructive',
                title: "Login Service Not Ready",
                description: "The Google login service is still initializing. Please try again in a moment.",
            });
        }
    };
    
    const handleLogout = () => {
        // As we are not storing the token on the client-side anymore,
        // a full logout is harder. For now, we just clear the state.
        setIsLoggedIn(false);
        clearPlaylists();
        toast({ title: "Logged out." });
    }

    const isReady = isGapiReady && isGsiReady;

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
