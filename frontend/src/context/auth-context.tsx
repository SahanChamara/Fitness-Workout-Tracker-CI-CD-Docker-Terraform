"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useQuery, useApolloClient, useMutation } from "@/lib/apollo-hooks";
import { ME_QUERY } from "@/lib/graphql/queries";
import { REFRESH_TOKEN_MUTATION } from "@/lib/graphql/mutations";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

interface User {
    id: string;
    username: string;
    email: string;
    displayName?: string;
    avatarUrl?: string;
}

interface AuthTokens {
    accessToken: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (tokens: AuthTokens, username: string) => void;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
    refreshAccessToken: () => Promise<boolean>;
}

interface MeQueryData {
    me: User | null;
}

interface RefreshTokenData {
    refreshToken: {
        token: string;
        username: string;
    };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Token expiry check - JWT tokens are typically valid for 15 minutes
const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // Refresh 5 minutes before expiry

export function AuthProvider({ children }: Readonly<{ children: React.ReactNode }>) {
    const [tokens, setTokens] = useState<AuthTokens | null>(null);
    const [tokenExpiry, setTokenExpiry] = useState<number | null>(null);
    const router = useRouter();
    const client = useApolloClient();
    const { toast } = useToast();
    const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isRefreshingRef = useRef(false);

    const [refreshTokenMutation] = useMutation<RefreshTokenData>(REFRESH_TOKEN_MUTATION);

    // Load token from localStorage on mount
    useEffect(() => {
        const storedAccessToken = localStorage.getItem("accessToken");
        const storedExpiry = localStorage.getItem("tokenExpiry");

        if (storedAccessToken) {
            setTokens({
                accessToken: storedAccessToken,
            });
            if (storedExpiry) {
                setTokenExpiry(Number.parseInt(storedExpiry, 10));
            }
        }
    }, []);

    // Fetch user data when we have a token
    const { data, loading, error, refetch } = useQuery<MeQueryData>(ME_QUERY, {
        skip: !tokens?.accessToken,
        fetchPolicy: "network-only",
    });

    // Decode JWT to get expiry time
    const decodeTokenExpiry = useCallback((token: string): number => {
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            return payload.exp * 1000; // Convert to milliseconds
        } catch (e) {
            console.error("Failed to decode token:", e);
            return Date.now() + 15 * 60 * 1000; // Default to 15 minutes from now
        }
    }, []);

    const clearSessionAndRedirect = useCallback(async () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("tokenExpiry");
        localStorage.removeItem("userId");
        localStorage.removeItem("username");

        setTokens(null);
        setTokenExpiry(null);

        if (refreshTimeoutRef.current) {
            clearTimeout(refreshTimeoutRef.current);
        }

        await client.resetStore();
        router.push("/login");
    }, [client, router]);

    // Refresh access token
    const refreshAccessToken = useCallback(async (): Promise<boolean> => {
        if (isRefreshingRef.current) {
            return false;
        }

        if (!tokens?.accessToken) {
            return false;
        }

        isRefreshingRef.current = true;

        try {
            const { data: refreshData } = await refreshTokenMutation({
                variables: { token: tokens.accessToken },
            });

            if (refreshData?.refreshToken) {
                const newAccessToken = refreshData.refreshToken.token;
                const expiry = decodeTokenExpiry(newAccessToken);

                localStorage.setItem("accessToken", newAccessToken);
                localStorage.setItem("tokenExpiry", expiry.toString());

                setTokens({
                    accessToken: newAccessToken,
                });
                setTokenExpiry(expiry);

                // Refetch user data with new token
                await refetch();

                return true;
            }
            return false;
        } catch (error) {
            console.error("Token refresh failed:", error);
            toast({
                title: "Session Expired",
                description: "Please log in again.",
                variant: "destructive",
            });
            await clearSessionAndRedirect();
            return false;
        } finally {
            isRefreshingRef.current = false;
        }
    }, [tokens, refreshTokenMutation, decodeTokenExpiry, refetch, toast, clearSessionAndRedirect]);

    // Setup automatic token refresh
    useEffect(() => {
        if (!tokenExpiry || !tokens) {
            return;
        }

        const scheduleRefresh = () => {
            if (refreshTimeoutRef.current) {
                clearTimeout(refreshTimeoutRef.current);
            }

            const now = Date.now();
            const timeUntilExpiry = tokenExpiry - now;
            const refreshTime = timeUntilExpiry - TOKEN_REFRESH_THRESHOLD;

            if (refreshTime > 0) {
                // Schedule refresh before token expires
                refreshTimeoutRef.current = setTimeout(() => {
                    refreshAccessToken();
                }, refreshTime);
            } else if (timeUntilExpiry > 0) {
                // Token is about to expire, refresh immediately
                refreshAccessToken();
            } else {
                // Token already expired
                toast({
                    title: "Session Expired",
                    description: "Please log in again.",
                    variant: "destructive",
                });
                clearSessionAndRedirect();
            }
        };

        scheduleRefresh();

        // Cleanup
        return () => {
            if (refreshTimeoutRef.current) {
                clearTimeout(refreshTimeoutRef.current);
            }
        };
    }, [tokenExpiry, tokens, refreshAccessToken, toast, clearSessionAndRedirect]);

    // Listen for token expiry events from Apollo error link
    useEffect(() => {
        const handleTokenExpired = () => {
            refreshAccessToken();
        };

        globalThis.addEventListener("auth:token-expired", handleTokenExpired);

        return () => {
            globalThis.removeEventListener("auth:token-expired", handleTokenExpired);
        };
    }, [refreshAccessToken]);

    // Handle authentication errors
    useEffect(() => {
        if (error && tokens) {
            console.error("Authentication error:", error);
            if (error.message.includes("Unauthorized") || error.message.includes("Invalid token")) {
                clearSessionAndRedirect();
            }
        }
    }, [error, tokens, clearSessionAndRedirect]);

    const login = useCallback((newTokens: AuthTokens, username: string) => {
        const expiry = decodeTokenExpiry(newTokens.accessToken);

        localStorage.setItem("accessToken", newTokens.accessToken);
        localStorage.setItem("tokenExpiry", expiry.toString());
        localStorage.setItem("username", username);

        setTokens(newTokens);
        setTokenExpiry(expiry);

        refetch();
        router.push("/dashboard");
    }, [decodeTokenExpiry, refetch, router]);

    const logout = useCallback(async () => {
        await clearSessionAndRedirect();
    }, [clearSessionAndRedirect]);

    const contextValue = useMemo(
        () => ({
            user: data?.me || null,
            loading: loading && !!tokens,
            login,
            logout,
            isAuthenticated: !!data?.me,
            refreshAccessToken,
        }),
        [data?.me, loading, tokens, login, logout, refreshAccessToken]
    );

    return (
        <AuthContext.Provider
            value={contextValue}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
