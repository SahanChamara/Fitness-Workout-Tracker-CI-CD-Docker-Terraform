"use client";

import { useMutation, useQuery } from "@/lib/apollo-hooks";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CHANGE_PASSWORD_MUTATION, DELETE_ACCOUNT_MUTATION, GET_CURRENT_USER } from "@/lib/graphql/settings";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";

const passwordSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

const deleteAccountSchema = z.object({
    password: z.string().min(1, "Password is required to delete your account"),
    confirmText: z.string().refine((val) => val === "DELETE", {
        message: "Please type DELETE to confirm",
    }),
});

type DeleteAccountFormValues = z.infer<typeof deleteAccountSchema>;

export default function SettingsPage() {
    const { user, logout } = useAuth();
    const { data: userData } = useQuery(GET_CURRENT_USER);
    const [changePassword, { loading: passwordLoading }] = useMutation(CHANGE_PASSWORD_MUTATION);
    const [deleteAccount, { loading: deleteLoading }] = useMutation(DELETE_ACCOUNT_MUTATION);
    const { toast } = useToast();
    const router = useRouter();
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const passwordForm = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    const deleteForm = useForm<DeleteAccountFormValues>({
        resolver: zodResolver(deleteAccountSchema),
        defaultValues: {
            password: "",
            confirmText: "",
        },
    });

    const onPasswordSubmit = async (values: PasswordFormValues) => {
        try {
            const { data } = await changePassword({
                variables: {
                    input: {
                        currentPassword: values.currentPassword,
                        newPassword: values.newPassword,
                    },
                },
            });

            if (data?.changePassword) {
                toast({
                    title: "Password changed",
                    description: "Your password has been successfully updated.",
                });
                passwordForm.reset();
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to change password",
                variant: "destructive",
            });
        }
    };

    const onDeleteAccount = async (values: DeleteAccountFormValues) => {
        try {
            const { data } = await deleteAccount();

            if (data?.deleteAccount) {
                toast({
                    title: "Account deleted",
                    description: "Your account has been permanently deleted.",
                });
                setTimeout(() => {
                    logout();
                    router.push("/login");
                }, 1500);
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to delete account",
                variant: "destructive",
            });
        } finally {
            setIsDeleteDialogOpen(false);
        }
    };

    if (!user) {
        return null;
    }

    return (
        <div className="container max-w-2xl py-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Settings</h1>
                    <p className="text-muted-foreground">
                        Manage your account settings and preferences
                    </p>
                </div>
                <Link href="/profile">
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Profile
                    </Button>
                </Link>
            </div>

            {/* Account Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                    <CardDescription>
                        View your account details
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="text-sm font-medium">Email</label>
                        <Input value={userData?.me?.email || user.email} disabled />
                        <p className="text-xs text-muted-foreground mt-1">
                            Your email address is used for login and notifications
                        </p>
                    </div>
                    <div>
                        <label className="text-sm font-medium">Username</label>
                        <Input value={`@${user.username}`} disabled />
                        <p className="text-xs text-muted-foreground mt-1">
                            Your unique username cannot be changed
                        </p>
                    </div>
                    <div>
                        <label className="text-sm font-medium">Member Since</label>
                        <Input
                            value={
                                userData?.me?.createdAt
                                    ? new Date(userData.me.createdAt).toLocaleDateString()
                                    : "N/A"
                            }
                            disabled
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Change Password */}
            <Card>
                <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>
                        Update your password to keep your account secure
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...passwordForm}>
                        <form
                            onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                            className="space-y-4"
                        >
                            <FormField
                                control={passwordForm.control}
                                name="currentPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Current Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="password"
                                                placeholder="Enter your current password"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={passwordForm.control}
                                name="newPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>New Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="password"
                                                placeholder="Enter your new password"
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Must be at least 8 characters with uppercase, lowercase, and number
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={passwordForm.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirm New Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="password"
                                                placeholder="Confirm your new password"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex justify-end">
                                <Button type="submit" disabled={passwordLoading}>
                                    {passwordLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Updating...
                                        </>
                                    ) : (
                                        "Update Password"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-destructive">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        Danger Zone
                    </CardTitle>
                    <CardDescription>
                        Irreversible actions that will permanently affect your account
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="rounded-lg border border-destructive/50 p-4 space-y-3">
                        <div>
                            <h4 className="font-medium text-destructive">Delete Account</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                                Once you delete your account, there is no going back. This will permanently:
                            </p>
                            <ul className="text-sm text-muted-foreground list-disc list-inside mt-2 space-y-1">
                                <li>Delete all your workouts and exercise data</li>
                                <li>Remove all your followers and following connections</li>
                                <li>Delete all your posts, comments, and likes</li>
                                <li>Permanently remove your account from our system</li>
                            </ul>
                        </div>

                        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" className="w-full">
                                    Delete My Account
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete your
                                        account and remove all your data from our servers.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <Form {...deleteForm}>
                                    <form onSubmit={deleteForm.handleSubmit(onDeleteAccount)} className="space-y-4">
                                        <FormField
                                            control={deleteForm.control}
                                            name="password"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Confirm Password</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            type="password"
                                                            placeholder="Enter your password"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={deleteForm.control}
                                            name="confirmText"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Type DELETE to confirm</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            placeholder="DELETE"
                                                        />
                                                    </FormControl>
                                                    <FormDescription>
                                                        Type the word DELETE in all caps to confirm
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <AlertDialogFooter>
                                            <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
                                            <Button
                                                type="submit"
                                                variant="destructive"
                                                disabled={deleteLoading}
                                            >
                                                {deleteLoading ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Deleting...
                                                    </>
                                                ) : (
                                                    "Delete Account"
                                                )}
                                            </Button>
                                        </AlertDialogFooter>
                                    </form>
                                </Form>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
