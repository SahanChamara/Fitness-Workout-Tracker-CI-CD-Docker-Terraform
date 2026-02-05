"use client";

import { useQuery } from "@/lib/apollo-hooks";
import { GET_FEED } from "@/lib/graphql/feed";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import Link from "next/link";
import { LikeButton } from "@/components/features/social/like-button";
import { CommentSection } from "@/components/features/social/comment-section";

export default function FeedPage() {
  const { data, loading, error, fetchMore } = useQuery(GET_FEED, {
    variables: { page: 0, size: 10 },
  });

  const [loadingMore, setLoadingMore] = useState(false);

  const feedItems = data?.feed?.content || [];
  const hasNext = data?.feed?.hasNext || false;

  const handleLoadMore = async () => {
    if (loadingMore || !hasNext) return;

    setLoadingMore(true);
    try {
      await fetchMore({
        variables: {
          page: Math.floor(feedItems.length / 10),
          size: 10,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;
          return {
            feed: {
              ...fetchMoreResult.feed,
              content: [
                ...prev.feed.content,
                ...fetchMoreResult.feed.content,
              ],
            },
          };
        },
      });
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-destructive">
        Error loading feed. Please try again.
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <h1 className="text-lg font-semibold md:text-2xl">Activity Feed</h1>
      
      {feedItems.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-2">
              <p className="text-muted-foreground">
                No activity yet. Follow users to see their updates!
              </p>
              <Button asChild>
                <Link href="/exercises">Explore Exercises</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {feedItems.map((item: any) => (
            <FeedItem key={item.id} item={item} />
          ))}

          {hasNext && (
            <Button
              variant="outline"
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="w-full"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading more...
                </>
              ) : (
                "Load More"
              )}
            </Button>
          )}
        </>
      )}
    </div>
  );
}

function FeedItem({ item }: { item: any }) {
  const [showComments, setShowComments] = useState(false);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Link href={`/profile/${item.user.username}`}>
            <Avatar className="h-10 w-10 cursor-pointer hover:opacity-80">
              <AvatarImage src={item.user.avatarUrl} />
              <AvatarFallback>
                {item.user.displayName?.[0] || item.user.username[0]}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1">
            <Link
              href={`/profile/${item.user.username}`}
              className="font-medium hover:underline"
            >
              {item.user.displayName || item.user.username}
            </Link>
            <p className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(item.createdAt), {
                addSuffix: true,
              })}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Feed Content */}
        <div>
          <p className="text-sm mb-2">{item.content}</p>
          {item.workout && (
            <Link href={`/workouts/${item.workout.id}`}>
              <Card className="hover:bg-accent transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <p className="font-medium">{item.workout.title}</p>
                </CardContent>
              </Card>
            </Link>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <LikeButton
            parentType="WORKOUT"
            parentId={item.workout?.id || item.id}
            initialIsLiked={item.isLiked || false}
            initialLikeCount={item.likeCount || 0}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="gap-2"
          >
            <MessageCircle className="h-4 w-4" />
            <span>{item.commentCount || 0}</span>
          </Button>
        </div>

        {/* Comments Section */}
        {showComments && item.workout && (
          <div className="pt-2 border-t">
            <CommentSection
              parentType="WORKOUT"
              parentId={item.workout.id}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
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
