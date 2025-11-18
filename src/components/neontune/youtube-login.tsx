
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Youtube } from "lucide-react";
import { SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { useToast } from '@/hooks/use-toast';
import { useYouTube } from '@/context/youtube-context';

// Define gapi and google on the window object
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
    const [tokenClient, setTokenClient] = useState<any>(null);
    const [isGapiLoaded, setIsGapiLoaded] = useState(false);
    const [isGsiLoaded, setIsGsiLoaded] = useState(false);
    const { toast } = useToast();
    const { isLoggedIn, setIsLoggedIn, clearPlaylists } = useYouTube();

    const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    const loadGapi = useCallback(() => {
        const script = document.createElement('script');
        script.src = 'https://apis.google.com/js/api.js';
        script.async = true;
        script.defer = true;
        script.onload = () => {
            window.gapi.load('client', () => {
                if (!apiKey || apiKey === "YOUR_YOUTUBE_API_KEY") {
                    console.error("YouTube API Key is missing.");
                    setIsGapiLoaded(true);
                    return;
                }
                window.gapi.client.init({
                    apiKey: apiKey,
                    discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest'],
                }).then(() => {
                    setIsGapiLoaded(true);
                }).catch((error: any) => {
                    console.error("Error initializing gapi client:", error);
                    setIsGapiLoaded(true);
                });
            });
        };
        document.body.appendChild(script);
    }, [apiKey]);
    
    const loadGsi = useCallback(() => {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => {
            if (window.google && window.google.accounts) {
                if (!clientId || clientId === "YOUR_GOOGLE_CLIENT_ID") {
                   console.error("Google Client ID is missing.");
                   setIsGsiLoaded(true);
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
                           toast({ variant: 'destructive', title: 'Login Error', description: error.message || 'An unknown error occurred during login.' });
                       }
                   });
                   setTokenClient(client);
               } catch(e) {
                   console.error("Error initializing token client", e);
               } finally {
                   setIsGsiLoaded(true);
               }
           }
        };
        document.body.appendChild(script);
    }, [clientId, toast, setIsLoggedIn, onLoginSuccess]);

    useEffect(() => {
        // Check if scripts are already loaded
        if (!window.gapi) {
            loadGapi();
        } else {
            setIsGapiLoaded(true);
        }
        if (!window.google || !window.google.accounts) {
            loadGsi();
        } else {
            setIsGsiLoaded(true);
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
        } else {
             toast({
                variant: 'destructive',
                title: "Login Service Not Ready",
                description: "The Google login service has not initialized. Please try again in a moment.",
            });
             if(!isGsiLoaded) loadGsi(); // Try to re-initialize
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
            <SidebarMenuButton onClick={isLoggedIn ? handleLogout : handleLogin} disabled={!isGapiLoaded || !isGsiLoaded}>
              <Youtube className="text-red-500" />
              <span>{isLoggedIn ? "Logout from YouTube" : "Login with YouTube"}</span>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
};

export default YouTubeLogin;

    