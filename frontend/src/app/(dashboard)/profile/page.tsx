"use client";

import { useQuery, useMutation, useApolloClient } from "@/lib/apollo-hooks";
import { useAuth } from "@/context/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { gql } from "@/lib/apollo-hooks";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

const UPDATE_PROFILE_MUTATION = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      id
      displayName
      bio
      avatarUrl
    }
  }
`;

const profileSchema = z.object({
    displayName: z.string().min(2, "Display name must be at least 2 characters"),
    bio: z.string().optional(),
    avatarUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [updateProfile, { loading }] = useMutation(UPDATE_PROFILE_MUTATION);

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            displayName: user?.displayName || "",
            bio: "", // TODO: Add bio to User type if needed
            avatarUrl: user?.avatarUrl || "",
        },
    });

    const onSubmit = async (data: ProfileFormValues) => {
        try {
            await updateProfile({
                variables: {
                    input: {
                        displayName: data.displayName,
                        bio: data.bio,
                        avatarUrl: data.avatarUrl,
                    },
                },
            });
            setIsEditing(false);
            // Ideally refetch user query here
        } catch (error) {
            console.error("Failed to update profile", error);
        }
    };

    if (!user) return <div>Loading profile...</div>;

    return (
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
            <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                    <Avatar className="h-20 w-20">
                        <AvatarImage src={user.avatarUrl} alt={user.username} />
                        <AvatarFallback className="text-lg">
                            {user.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-1">
                        <CardTitle className="text-2xl">{user.displayName}</CardTitle>
                        <CardDescription>@{user.username}</CardDescription>
                    </div>
                    <Button
                        variant="outline"
                        className="ml-auto"
                        onClick={() => setIsEditing(!isEditing)}
                    >
                        {isEditing ? "Cancel" : "Edit Profile"}
                    </Button>
                </CardHeader>
                <CardContent>
                    {isEditing ? (
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className="space-y-4"
                            >
                                <FormField
                                    control={form.control}
                                    name="displayName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Display Name</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="bio"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Bio</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Tell us about yourself" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="avatarUrl"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Avatar URL</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="https://..." />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" disabled={loading}>
                                    {loading ? "Saving..." : "Save Changes"}
                                </Button>
                            </form>
                        </Form>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-medium">Bio</h3>
                                <p className="text-sm text-muted-foreground">
                                    No bio provided yet.
                                </p>
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div className="rounded-md border p-2">
                                    <div className="text-2xl font-bold">0</div>
                                    <div className="text-xs text-muted-foreground">Workouts</div>
                                </div>
                                <div className="rounded-md border p-2">
                                    <div className="text-2xl font-bold">0</div>
                                    <div className="text-xs text-muted-foreground">Followers</div>
                                </div>
                                <div className="rounded-md border p-2">
                                    <div className="text-2xl font-bold">0</div>
                                    <div className="text-xs text-muted-foreground">Following</div>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
