"use client";

import { useState } from "react";
import { useMutation } from "@/lib/apollo-hooks";
import { LIKE_MUTATION } from "@/lib/graphql/feed";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface LikeButtonProps {
  parentType: "WORKOUT" | "COMMENT";
  parentId: string;
  initialIsLiked: boolean;
  initialLikeCount: number;
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
  showCount?: boolean;
}

export function LikeButton({
  parentType,
  parentId,
  initialIsLiked,
  initialLikeCount,
  variant = "ghost",
  size = "sm",
  showCount = true,
}: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [likeMutation, { loading }] = useMutation(LIKE_MUTATION);
  const { toast } = useToast();

  const handleLike = async () => {
    // Optimistic update
    const newIsLiked = !isLiked;
    const previousIsLiked = isLiked;
    const previousLikeCount = likeCount;

    setIsLiked(newIsLiked);
    setLikeCount((prev) => (newIsLiked ? prev + 1 : Math.max(0, prev - 1)));

    try {
      await likeMutation({
        variables: {
          parentType,
          parentId,
        },
      });
    } catch (error) {
      // Revert on error
      setIsLiked(previousIsLiked);
      setLikeCount(previousLikeCount);
      
      console.error("Failed to like:", error);
      toast({
        title: "Error",
        description: "Failed to update like. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLike}
      disabled={loading}
      className={cn(
        "gap-2",
        isLiked && "text-red-500 hover:text-red-600"
      )}
    >
      <Heart
        className={cn(
          "h-4 w-4",
          isLiked && "fill-current"
        )}
      />
      {showCount && <span>{likeCount}</span>}
    </Button>
  );
}
