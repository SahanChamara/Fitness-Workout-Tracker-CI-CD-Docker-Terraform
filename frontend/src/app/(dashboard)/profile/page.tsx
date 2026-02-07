"use client";

import { useMutation } from "@/lib/apollo-hooks";
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
import { Textarea } from "@/components/ui/textarea";
import { UPDATE_PROFILE_MUTATION, GET_CURRENT_USER } from "@/lib/graphql/settings";
import { useState, useEffect } from "react";
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
import { AvatarUpload } from "@/components/features/profile/avatar-upload";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Settings } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

const profileSchema = z.object({
    displayName: z.string().min(2, "Display name must be at least 2 characters").max(50, "Display name must be less than 50 characters"),
    bio: z.string().max(160, "Bio must be less than 160 characters").optional(),
    avatarUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
    const { user, refetchUser } = useAuth();
    const [updateProfile, { loading }] = useMutation(UPDATE_PROFILE_MUTATION);
    const { toast } = useToast();

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            displayName: "",
            bio: "",
            avatarUrl: "",
        },
    });

    // Update form when user data loads
    useEffect(() => {
        if (user) {
            form.reset({
                displayName: user.displayName || "",
                bio: user.bio || "",
                avatarUrl: user.avatarUrl || "",
            });
        }
    }, [user, form]);

    const onSubmit = async (data: ProfileFormValues) => {
        try {
            await updateProfile({
                variables: {
                    input: {
                        displayName: data.displayName,
                        bio: data.bio || null,
                        avatarUrl: data.avatarUrl || null,
                    },
                },
                refetchQueries: [{ query: GET_CURRENT_USER }],
            });

            await refetchUser();

            toast({
                title: "Profile updated",
                description: "Your profile has been updated successfully",
            });
        } catch (error) {
            console.error("Failed to update profile", error);
            toast({
                title: "Update failed",
                description: "Failed to update profile. Please try again.",
                variant: "destructive",
            });
        }
    };

    const handleAvatarUpload = (url: string) => {
        form.setValue("avatarUrl", url);
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Edit Profile</h1>
                    <p className="text-muted-foreground">
                        Manage your public profile information
                    </p>
                </div>
                <Button asChild variant="outline">
                    <Link href="/settings">
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                        Update your profile details and avatar
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    >
                        {isEditing ? "Cancel" : "Edit Profile"}
                    </Button>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-6"
                        >
                            {/* Avatar Upload */}
                            <FormField
                                control={form.control}
                                name="avatarUrl"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Profile Picture</FormLabel>
                                        <FormControl>
                                            <AvatarUpload
                                                currentAvatarUrl={field.value}
                                                username={user.username}
                                                onUploadComplete={(url) => {
                                                    field.onChange(url);
                                                    form.handleSubmit(onSubmit)();
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Separator />

                            {/* Display Name */}
                            <FormField
                                control={form.control}
                                name="displayName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Display Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="Enter your display name"
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            This is your public display name. It can be your real name or a nickname.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Username (read-only) */}
                            <FormItem>
                                <FormLabel>Username</FormLabel>
                                <Input value={`@${user.username}`} disabled />
                                <FormDescription>
                                    Your username cannot be changed.
                                </FormDescription>
                            </FormItem>

                            {/* Bio */}
                            <FormField
                                control={form.control}
                                name="bio"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Bio</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                {...field}
                                                placeholder="Tell us about yourself..."
                                                rows={3}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Brief description for your profile. Max 160 characters.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-end">
                                <Button type="submit" disabled={loading}>
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        "Save Changes"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
