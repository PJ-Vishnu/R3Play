"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Youtube } from "lucide-react";
import { SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { useToast } from '@/hooks/use-toast';

const YouTubeLogin: React.FC = () => {
    const [tokenClient, setTokenClient] = useState<any>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const { toast } = useToast();

    const loadGapi = useCallback(() => {
        if (window.gapi) {
            window.gapi.load('client', () => {
                window.gapi.client.init({
                    apiKey: process.env.NEXT_PUBLIC_YOUTUBE_API_KEY,
                    discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest'],
                });
            });
        }
    }, []);

    const loadGsi = useCallback(() => {
        if (window.google) {
            const client = window.google.accounts.oauth2.initTokenClient({
                client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
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
    }, [toast]);
    
    useEffect(() => {
        loadGapi();
        loadGsi();
    }, [loadGapi, loadGsi]);

    const handleLogin = () => {
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
            <SidebarMenuButton onClick={isLoggedIn ? handleLogout : handleLogin}>
              <Youtube className="text-red-500" />
              <span>{isLoggedIn ? "Logout from YouTube Music" : "Login with YouTube Music"}</span>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
};

export default YouTubeLogin;
