"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@/lib/apollo-hooks";
import { GET_COMMENTS, ADD_COMMENT, DELETE_COMMENT } from "@/lib/graphql/comments";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Trash2, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";

interface CommentSectionProps {
  parentType: "WORKOUT" | "EXERCISE";
  parentId: string;
}

export function CommentSection({ parentType, parentId }: CommentSectionProps) {
  const { userId } = useAuth();
  const { toast } = useToast();
  const [newComment, setNewComment] = useState("");

  const { data, loading, error, refetch } = useQuery(GET_COMMENTS, {
    variables: {
      parentType,
      parentId,
      page: 0,
      size: 20,
    },
  });

  const [addComment, { loading: addingComment }] = useMutation(ADD_COMMENT);
  const [deleteComment] = useMutation(DELETE_COMMENT);

  const comments = data?.comments?.content || [];

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) {
      return;
    }

    try {
      await addComment({
        variables: {
          input: {
            parentType,
            parentId,
            content: newComment.trim(),
          },
        },
      });

      setNewComment("");
      refetch();

      toast({
        title: "Success",
        description: "Comment added successfully",
      });
    } catch (error) {
      console.error("Failed to add comment:", error);
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment({
        variables: { id: commentId },
      });

      refetch();

      toast({
        title: "Success",
        description: "Comment deleted successfully",
      });
    } catch (error) {
      console.error("Failed to delete comment:", error);
      toast({
        title: "Error",
        description: "Failed to delete comment. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-destructive">
        Failed to load comments. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Comment List */}
      <div className="space-y-3">
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map((comment: any) => (
            <Card key={comment.id}>
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.user.avatarUrl} />
                    <AvatarFallback>
                      {comment.user.displayName?.[0] || comment.user.username[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">
                          {comment.user.displayName || comment.user.username}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.createdAt), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                      {comment.user.id === userId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteComment(comment.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add Comment Form */}
      <form onSubmit={handleAddComment} className="flex gap-2">
        <Input
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          disabled={addingComment}
        />
        <Button type="submit" size="icon" disabled={addingComment || !newComment.trim()}>
          {addingComment ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
}
