"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useQuery, useApolloClient, useMutation } from "@/lib/apollo-hooks";
import { ME_QUERY } from "@/lib/graphql/queries";
import { REFRESH_TOKEN_MUTATION, LOGOUT_ALL_SESSIONS_MUTATION } from "@/lib/graphql/mutations";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { setAccessToken } from "@/lib/auth-token";

interface User {
  id: string;
  username: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
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
    refreshToken: string;
    username: string;
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000;

function decodeTokenExpiry(token: string): number {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000;
  } catch {
    return Date.now() + 15 * 60 * 1000;
  }
}

export function AuthProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [refreshToken, setRefreshTokenState] = useState<string | null>(null);
  const [tokenExpiry, setTokenExpiry] = useState<number | null>(null);
  const router = useRouter();
  const client = useApolloClient();
  const { toast } = useToast();
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = useRef(false);

  const [refreshTokenMutation] = useMutation<RefreshTokenData>(REFRESH_TOKEN_MUTATION);
  const [logoutAllSessionsMutation] = useMutation(LOGOUT_ALL_SESSIONS_MUTATION);

  useEffect(() => {
    const storedRefreshToken = localStorage.getItem("refreshToken");
    if (storedRefreshToken) {
      setRefreshTokenState(storedRefreshToken);
      refreshAccessToken();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { data, loading, error, refetch } = useQuery<MeQueryData>(ME_QUERY, {
    skip: !accessToken,
    fetchPolicy: "network-only",
  });

  const setSession = useCallback((nextAccessToken: string | null, nextRefreshToken: string | null) => {
    setAccessTokenState(nextAccessToken);
    setRefreshTokenState(nextRefreshToken);
    setAccessToken(nextAccessToken);

    if (nextAccessToken) {
      setTokenExpiry(decodeTokenExpiry(nextAccessToken));
    } else {
      setTokenExpiry(null);
    }

    if (nextRefreshToken) {
      localStorage.setItem("refreshToken", nextRefreshToken);
    } else {
      localStorage.removeItem("refreshToken");
    }
  }, []);

  const clearSessionAndRedirect = useCallback(async () => {
    setSession(null, null);
    localStorage.removeItem("username");

    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    await client.resetStore();
    router.push("/login");
  }, [client, router, setSession]);

  const refreshAccessToken = useCallback(async (): Promise<boolean> => {
    if (isRefreshingRef.current || !refreshToken) {
      return false;
    }

    isRefreshingRef.current = true;
    try {
      const { data: refreshData } = await refreshTokenMutation({
        variables: { token: refreshToken },
      });

      if (refreshData?.refreshToken?.token && refreshData.refreshToken.refreshToken) {
        setSession(refreshData.refreshToken.token, refreshData.refreshToken.refreshToken);
        await refetch();
        return true;
      }

      return false;
    } catch {
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
  }, [refreshToken, refreshTokenMutation, refetch, clearSessionAndRedirect, setSession, toast]);

  useEffect(() => {
    if (!tokenExpiry || !accessToken) {
      return;
    }

    const now = Date.now();
    const timeUntilExpiry = tokenExpiry - now;
    const refreshTime = timeUntilExpiry - TOKEN_REFRESH_THRESHOLD;

    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    if (refreshTime > 0) {
      refreshTimeoutRef.current = setTimeout(() => {
        refreshAccessToken();
      }, refreshTime);
    } else if (timeUntilExpiry > 0) {
      refreshAccessToken();
    } else {
      clearSessionAndRedirect();
    }

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [tokenExpiry, accessToken, refreshAccessToken, clearSessionAndRedirect]);

  useEffect(() => {
    const handleTokenExpired = () => {
      refreshAccessToken();
    };

    globalThis.addEventListener("auth:token-expired", handleTokenExpired);
    return () => {
      globalThis.removeEventListener("auth:token-expired", handleTokenExpired);
    };
  }, [refreshAccessToken]);

  useEffect(() => {
    if (!error || !accessToken) {
      return;
    }
    if (error.message.includes("Unauthorized") || error.message.includes("Invalid token")) {
      clearSessionAndRedirect();
    }
  }, [error, accessToken, clearSessionAndRedirect]);

  const login = useCallback(
    (tokens: AuthTokens, username: string) => {
      setSession(tokens.accessToken, tokens.refreshToken);
      localStorage.setItem("username", username);
      refetch();
      router.push("/dashboard");
    },
    [refetch, router, setSession]
  );

  const logout = useCallback(async () => {
    try {
      await logoutAllSessionsMutation();
    } finally {
      await clearSessionAndRedirect();
    }
  }, [logoutAllSessionsMutation, clearSessionAndRedirect]);

  const contextValue = useMemo(
    () => ({
      user: data?.me || null,
      loading: loading && !!accessToken,
      login,
      logout,
      isAuthenticated: !!data?.me,
      refreshAccessToken,
    }),
    [data?.me, loading, accessToken, login, logout, refreshAccessToken]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

