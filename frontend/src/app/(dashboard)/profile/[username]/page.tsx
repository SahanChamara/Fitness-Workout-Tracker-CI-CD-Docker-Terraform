"use client";

import { useQuery } from "@/lib/apollo-hooks";
import { GET_USER_PROFILE, GET_USER_WORKOUTS } from "@/lib/graphql/profile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, Calendar, TrendingUp } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { FollowButton } from "@/components/features/social/follow-button";
import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useParams } from "next/navigation";

export default function UserProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const { user: currentUser } = useAuth();
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  const {
    data: userData,
    loading: userLoading,
    error: userError,
  } = useQuery(GET_USER_PROFILE, {
    variables: { username },
    onCompleted: (data) => {
      setFollowersCount(data.userByUsername?.followersCount || 0);
      setFollowingCount(data.userByUsername?.followingCount || 0);
    },
  });

  const {
    data: workoutsData,
    loading: workoutsLoading,
    fetchMore,
  } = useQuery(GET_USER_WORKOUTS, {
    variables: { userId: userData?.userByUsername?.id, page: 0, size: 10 },
    skip: !userData?.userByUsername?.id,
  });

  const user = userData?.userByUsername;
  const workouts = workoutsData?.userWorkouts?.content || [];
  const hasMoreWorkouts = workoutsData?.userWorkouts?.hasNext || false;

  const handleFollowChange = (isFollowing: boolean) => {
    setFollowersCount((prev) => (isFollowing ? prev + 1 : prev - 1));
  };

  const handleLoadMoreWorkouts = async () => {
    if (!hasMoreWorkouts) return;

    await fetchMore({
      variables: {
        userId: user.id,
        page: Math.floor(workouts.length / 10),
        size: 10,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return {
          userWorkouts: {
            ...fetchMoreResult.userWorkouts,
            content: [
              ...prev.userWorkouts.content,
              ...fetchMoreResult.userWorkouts.content,
            ],
          },
        };
      },
    });
  };

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (userError || !user) {
    return (
      <div className="text-center text-destructive">
        User not found or error loading profile.
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === user.id;

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <Avatar className="h-24 w-24 md:h-32 md:w-32">
              <AvatarImage src={user.avatarUrl} />
              <AvatarFallback className="text-2xl">
                {user.displayName?.[0] || user.username[0]}
              </AvatarFallback>
            </Avatar>

            {/* User Info */}
            <div className="flex-1 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold">
                    {user.displayName || user.username}
                  </h1>
                  <p className="text-muted-foreground">@{user.username}</p>
                </div>
                <div className="flex gap-2">
                  {isOwnProfile ? (
                    <Button asChild>
                      <Link href="/profile">Edit Profile</Link>
                    </Button>
                  ) : (
                    <FollowButton
                      userId={user.id}
                      initialIsFollowing={user.isFollowing || false}
                      onFollowChange={handleFollowChange}
                    />
                  )}
                </div>
              </div>

              {/* Bio */}
              {user.bio && (
                <p className="text-sm text-muted-foreground">{user.bio}</p>
              )}

              {/* Stats */}
              <div className="flex gap-6">
                <Link
                  href={`/profile/${username}/followers`}
                  className="hover:underline"
                >
                  <div className="text-center">
                    <p className="text-2xl font-bold">{followersCount}</p>
                    <p className="text-sm text-muted-foreground">Followers</p>
                  </div>
                </Link>
                <Link
                  href={`/profile/${username}/following`}
                  className="hover:underline"
                >
                  <div className="text-center">
                    <p className="text-2xl font-bold">{followingCount}</p>
                    <p className="text-sm text-muted-foreground">Following</p>
                  </div>
                </Link>
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {workouts.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Workouts</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Workouts Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Workouts</h2>
        
        {workoutsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : workouts.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <p className="text-center text-muted-foreground">
                No workouts yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              {workouts.map((workout: any) => (
                <Link key={workout.id} href={`/workouts/${workout.id}`}>
                  <Card className="hover:bg-accent transition-colors cursor-pointer h-full">
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {workout.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {workout.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {workout.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDistanceToNow(new Date(workout.createdAt), {
                            addSuffix: true,
                          })}
                        </div>
                        {workout.totalExercises && (
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4" />
                            {workout.totalExercises} exercises
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {hasMoreWorkouts && (
              <Button
                variant="outline"
                onClick={handleLoadMoreWorkouts}
                className="w-full"
              >
                Load More Workouts
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
