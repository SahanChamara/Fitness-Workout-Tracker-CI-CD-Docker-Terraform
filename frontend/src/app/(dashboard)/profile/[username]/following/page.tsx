"use client";

import { useQuery } from "@/lib/apollo-hooks";
import { GET_FOLLOWING, GET_USER_PROFILE } from "@/lib/graphql/profile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";
import { FollowButton } from "@/components/features/social/follow-button";
import { useAuth } from "@/context/auth-context";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function FollowingPage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  const { user: currentUser } = useAuth();

  const { data: userData, loading: userLoading } = useQuery(GET_USER_PROFILE, {
    variables: { username },
  });

  const {
    data: followingData,
    loading: followingLoading,
    fetchMore,
  } = useQuery(GET_FOLLOWING, {
    variables: {
      userId: userData?.userByUsername?.id,
      page: 0,
      size: 20,
    },
    skip: !userData?.userByUsername?.id,
  });

  const user = userData?.userByUsername;
  const following = followingData?.following?.content || [];
  const hasMore = followingData?.following?.hasNext || false;

  const handleLoadMore = async () => {
    if (!hasMore) return;

    await fetchMore({
      variables: {
        userId: user.id,
        page: Math.floor(following.length / 20),
        size: 20,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return {
          following: {
            ...fetchMoreResult.following,
            content: [
              ...prev.following.content,
              ...fetchMoreResult.following.content,
            ],
          },
        };
      },
    });
  };

  if (userLoading || followingLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center text-destructive">User not found.</div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Following</h1>
          <p className="text-sm text-muted-foreground">
            @{username}'s following
          </p>
        </div>
      </div>

      {/* Following List */}
      {following.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">
              Not following anyone yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {following.map((followedUser: any) => (
            <Card key={followedUser.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <Link
                    href={`/profile/${followedUser.username}`}
                    className="flex items-center gap-3 flex-1 hover:opacity-80"
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={followedUser.avatarUrl} />
                      <AvatarFallback>
                        {followedUser.displayName?.[0] ||
                          followedUser.username[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">
                        {followedUser.displayName || followedUser.username}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        @{followedUser.username}
                      </p>
                      {followedUser.bio && (
                        <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                          {followedUser.bio}
                        </p>
                      )}
                    </div>
                  </Link>
                  {currentUser?.id !== followedUser.id && (
                    <FollowButton
                      userId={followedUser.id}
                      initialIsFollowing={followedUser.isFollowing || false}
                      size="sm"
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {hasMore && (
            <Button
              variant="outline"
              onClick={handleLoadMore}
              className="w-full"
            >
              Load More
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
