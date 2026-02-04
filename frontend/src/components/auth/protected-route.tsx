"use client";

import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, ComponentType } from "react";

/**
 * Higher-Order Component for protecting routes that require authentication
 * Automatically redirects unauthenticated users to the login page
 * 
 * @example
 * export default withAuth(DashboardPage);
 */
export function withAuth<P extends object>(Component: ComponentType<P>) {
    return function ProtectedRoute(props: P) {
        const { isAuthenticated, loading } = useAuth();
        const router = useRouter();

        useEffect(() => {
            if (!loading && !isAuthenticated) {
                // Store the intended destination for redirect after login
                const currentPath = window.location.pathname + window.location.search;
                if (currentPath !== "/login" && currentPath !== "/signup") {
                    localStorage.setItem("redirectAfterLogin", currentPath);
                }
                router.push("/login");
            }
        }, [isAuthenticated, loading, router]);

        // Show loading state while checking authentication
        if (loading) {
            return (
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            );
        }

        // Don't render the component if not authenticated
        if (!isAuthenticated) {
            return null;
        }

        return <Component {...props} />;
    };
}

/**
 * Component wrapper for protecting routes (alternative to HOC)
 * Can be used directly in the component tree
 * 
 * @example
 * <ProtectedRoute>
 *   <DashboardContent />
 * </ProtectedRoute>
 */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            const currentPath = window.location.pathname + window.location.search;
            if (currentPath !== "/login" && currentPath !== "/signup") {
                localStorage.setItem("redirectAfterLogin", currentPath);
            }
            router.push("/login");
        }
    }, [isAuthenticated, loading, router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return <>{children}</>;
}
