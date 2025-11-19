
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
        tokenClient: any;
    }
}

interface YouTubeLoginProps {
    onLoginSuccess: () => void;
}

const YouTubeLogin: React.FC<YouTubeLoginProps> = ({ onLoginSuccess }) => {
    const [isGapiReady, setIsGapiReady] = useState(false);
    const [isGsiReady, setIsGsiReady] = useState(false);
    const { toast } = useToast();
    const { isLoggedIn, setIsLoggedIn, clearYouTubeData } = useYouTube();

    const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    const gapiLoaded = useCallback(() => {
        if (!apiKey || apiKey === "YOUR_YOUTUBE_API_KEY") return;
        window.gapi.load('client', async () => {
            await window.gapi.client.init({
                apiKey: apiKey,
                discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest'],
            });
            setIsGapiReady(true);
        });
    }, [apiKey]);

    const gsiLoaded = useCallback(() => {
        if (!clientId || clientId === "YOUR_GOOGLE_CLIENT_ID") return;
        
        window.tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: clientId,
            scope: 'https://www.googleapis.com/auth/youtube',
            callback: (tokenResponse: any) => {
                if (tokenResponse.access_token) {
                    localStorage.setItem('gapi_token', JSON.stringify(tokenResponse));
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
        setIsGsiReady(true);
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

    useEffect(() => {
        if (isGapiReady && isGsiReady) {
            const storedToken = localStorage.getItem('gapi_token');
            if (storedToken) {
                try {
                    const token = JSON.parse(storedToken);
                    // Check if token is expired, if so, clear it.
                    // The 'expires_in' is in seconds from the time it was fetched. We need to store a timestamp.
                    // For simplicity, we'll just use the token and let it fail if expired, user can re-login.
                    window.gapi.client.setToken(token);
                    setIsLoggedIn(true);
                    onLoginSuccess();
                } catch (e) {
                    console.error("Failed to parse token from localStorage", e);
                    localStorage.removeItem('gapi_token');
                }
            }
        }
    }, [isGapiReady, isGsiReady, setIsLoggedIn, onLoginSuccess]);
    

    const handleLogin = () => {
        if (!apiKey || apiKey === "YOUR_YOUTUBE_API_KEY" || !clientId || clientId === "YOUR_GOOGLE_CLIENT_ID") {
            toast({
                variant: 'destructive',
                title: "Configuration Missing",
                description: "Please add your YouTube API Key and Google Client ID to the .env.local file.",
            });
            return;
        }

        if (window.tokenClient) {
            window.tokenClient.requestAccessToken();
        } else {
            toast({ variant: 'destructive', title: 'Login Service Not Ready', description: 'Please wait a moment and try again.' });
        }
    };
    
    if (!isLoggedIn) {
        return (
            <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogin} disabled={!isGapiReady || !isGsiReady}>
                <Youtube className="text-red-500" />
                <span>Login with YouTube</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
        );
    }

    return null;
};

export default YouTubeLogin;
