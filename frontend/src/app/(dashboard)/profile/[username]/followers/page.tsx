"use client";

import { useQuery } from "@/lib/apollo-hooks";
import { GET_FOLLOWERS, GET_USER_PROFILE } from "@/lib/graphql/profile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";
import { FollowButton } from "@/components/features/social/follow-button";
import { useAuth } from "@/context/auth-context";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function FollowersPage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  const { user: currentUser } = useAuth();

  const { data: userData, loading: userLoading } = useQuery(GET_USER_PROFILE, {
    variables: { username },
  });

  const {
    data: followersData,
    loading: followersLoading,
    fetchMore,
  } = useQuery(GET_FOLLOWERS, {
    variables: {
      userId: userData?.userByUsername?.id,
      page: 0,
      size: 20,
    },
    skip: !userData?.userByUsername?.id,
  });

  const user = userData?.userByUsername;
  const followers = followersData?.followers?.content || [];
  const hasMore = followersData?.followers?.hasNext || false;

  const handleLoadMore = async () => {
    if (!hasMore) return;

    await fetchMore({
      variables: {
        userId: user.id,
        page: Math.floor(followers.length / 20),
        size: 20,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return {
          followers: {
            ...fetchMoreResult.followers,
            content: [
              ...prev.followers.content,
              ...fetchMoreResult.followers.content,
            ],
          },
        };
      },
    });
  };

  if (userLoading || followersLoading) {
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
          <h1 className="text-2xl font-bold">Followers</h1>
          <p className="text-sm text-muted-foreground">
            @{username}'s followers
          </p>
        </div>
      </div>

      {/* Followers List */}
      {followers.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">
              No followers yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {followers.map((follower: any) => (
            <Card key={follower.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <Link
                    href={`/profile/${follower.username}`}
                    className="flex items-center gap-3 flex-1 hover:opacity-80"
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={follower.avatarUrl} />
                      <AvatarFallback>
                        {follower.displayName?.[0] || follower.username[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">
                        {follower.displayName || follower.username}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        @{follower.username}
                      </p>
                      {follower.bio && (
                        <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                          {follower.bio}
                        </p>
                      )}
                    </div>
                  </Link>
                  {currentUser?.id !== follower.id && (
                    <FollowButton
                      userId={follower.id}
                      initialIsFollowing={follower.isFollowing || false}
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
