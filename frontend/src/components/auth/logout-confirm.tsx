"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/context/auth-context";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface LogoutConfirmProps {
    trigger?: React.ReactNode;
    onLogoutStart?: () => void;
    onLogoutComplete?: () => void;
}

/**
 * Logout confirmation dialog component
 * Displays a confirmation dialog before logging out
 * 
 * @example
 * <LogoutConfirm />
 * 
 * @example With custom trigger
 * <LogoutConfirm trigger={<Button>Sign Out</Button>} />
 */
export function LogoutConfirm({
    trigger,
    onLogoutStart,
    onLogoutComplete,
}: LogoutConfirmProps) {
    const [open, setOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const { logout } = useAuth();

    const handleLogout = async () => {
        setIsLoggingOut(true);
        onLogoutStart?.();

        try {
            await logout();
            onLogoutComplete?.();
        } catch (error) {
            console.error("Logout failed:", error);
        } finally {
            setIsLoggingOut(false);
            setOpen(false);
        }
    };

    return (
        <>
            <div onClick={() => setOpen(true)}>
                {trigger || (
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                    </Button>
                )}
            </div>

            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to log out? You'll need to log in again to access your account.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isLoggingOut}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            {isLoggingOut ? "Logging out..." : "Logout"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
