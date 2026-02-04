"use client";

import { useQuery, useMutation } from "@/lib/apollo-hooks";
import { GET_FEED, LIKE_MUTATION } from "@/lib/graphql/feed";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function FeedPage() {
    const { data, loading, error, fetchMore } = useQuery(GET_FEED, {
        variables: { page: 0, size: 10 },
    });

    if (loading) return <div>Loading feed...</div>;
    if (error) return <div>Error loading feed</div>;

    const feedItems = data?.feed?.content || [];

    return (
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
            <h1 className="text-lg font-semibold md:text-2xl">Activity Feed</h1>
            {feedItems.map((item: any) => (
                <FeedItem key={item.id} item={item} />
            ))}
            {feedItems.length === 0 && (
                <div className="text-center text-muted-foreground">
                    No activity yet. Follow users to see their updates!
                </div>
            )}
        </div>
    );
}

function FeedItem({ item }: { item: any }) {
    const [isLiked, setIsLiked] = useState(item.isLiked);
    const [likeCount, setLikeCount] = useState(item.likeCount);
    const [likeMutation] = useMutation(LIKE_MUTATION);

    const handleLike = async () => {
        // Optimistic update
        const newIsLiked = !isLiked;
        setIsLiked(newIsLiked);
        setLikeCount((prev: number) => (newIsLiked ? prev + 1 : prev - 1));

        try {
            await likeMutation({
                variables: {
                    parentType: item.type === "WORKOUT" ? "WORKOUT" : "ROUTINE", // Simplified logic
                    parentId: item.workout?.id || item.id, // Fallback logic needs refinement based on actual schema
                },
            });
        } catch (error) {
            // Revert on error
            setIsLiked(!newIsLiked);
            setLikeCount((prev: number) => (!newIsLiked ? prev + 1 : prev - 1));
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-start gap-4 p-4">
                <Avatar>
                    <AvatarImage src={item.user.avatarUrl} alt={item.user.username} />
                    <AvatarFallback>
                        {item.user.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold">{item.user.displayName}</span>
                        <span className="text-muted-foreground">
                            @{item.user.username}
                        </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                    </span>
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <div className="mb-4">
                    {item.type === "WORKOUT" && (
                        <div className="rounded-md bg-muted p-3">
                            <span className="font-medium">Completed a workout: </span>
                            <span className="font-bold">{item.workout?.title}</span>
                        </div>
                    )}
                    {item.content && <p className="mt-2">{item.content}</p>}
                </div>
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        className={cn("gap-2", isLiked && "text-red-500")}
                        onClick={handleLike}
                    >
                        <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
                        {likeCount}
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-2">
                        <MessageCircle className="h-4 w-4" />
                        {item.commentCount}
                    </Button>
                    <Button variant="ghost" size="sm" className="ml-auto">
                        <Share2 className="h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
