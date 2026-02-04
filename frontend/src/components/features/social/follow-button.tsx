"use client";

import { useState } from "react";
import { useMutation } from "@/lib/apollo-hooks";
import { FOLLOW_USER, UNFOLLOW_USER } from "@/lib/graphql/profile";
import { Button } from "@/components/ui/button";
import { Loader2, UserPlus, UserMinus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FollowButtonProps {
  userId: string;
  initialIsFollowing: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
  variant?: "default" | "ghost" | "outline" | "secondary";
  size?: "default" | "sm" | "lg";
}

export function FollowButton({
  userId,
  initialIsFollowing,
  onFollowChange,
  variant = "default",
  size = "default",
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const { toast } = useToast();

  const [followMutation, { loading: followLoading }] = useMutation(FOLLOW_USER);
  const [unfollowMutation, { loading: unfollowLoading }] = useMutation(UNFOLLOW_USER);

  const loading = followLoading || unfollowLoading;

  const handleFollowToggle = async () => {
    const previousIsFollowing = isFollowing;
    const newIsFollowing = !isFollowing;

    // Optimistic update
    setIsFollowing(newIsFollowing);

    try {
      if (newIsFollowing) {
        await followMutation({
          variables: { userId },
        });
        toast({
          title: "Success",
          description: "You are now following this user",
        });
      } else {
        await unfollowMutation({
          variables: { userId },
        });
        toast({
          title: "Success",
          description: "You unfollowed this user",
        });
      }

      // Notify parent component
      if (onFollowChange) {
        onFollowChange(newIsFollowing);
      }
    } catch (error) {
      // Revert on error
      setIsFollowing(previousIsFollowing);

      console.error("Failed to update follow status:", error);
      toast({
        title: "Error",
        description: "Failed to update follow status. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      variant={isFollowing ? "outline" : variant}
      size={size}
      onClick={handleFollowToggle}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : isFollowing ? (
        <UserMinus className="h-4 w-4 mr-2" />
      ) : (
        <UserPlus className="h-4 w-4 mr-2" />
      )}
      {isFollowing ? "Unfollow" : "Follow"}
    </Button>
  );
}
