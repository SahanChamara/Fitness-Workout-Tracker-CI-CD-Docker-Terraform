"use client";

import { useState } from "react";
import { useMutation } from "@/lib/apollo-hooks";
import { DELETE_WORKOUT_MUTATION } from "@/lib/graphql/workouts";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DeleteWorkoutDialogProps {
  workoutId: string;
  workoutTitle: string;
  onDeleted?: () => void;
  children: React.ReactNode;
}

export function DeleteWorkoutDialog({
  workoutId,
  workoutTitle,
  onDeleted,
  children,
}: DeleteWorkoutDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const [deleteWorkout, { loading }] = useMutation(DELETE_WORKOUT_MUTATION);

  const handleDelete = async () => {
    try {
      await deleteWorkout({
        variables: { id: workoutId },
      });

      toast({
        title: "Success",
        description: "Workout deleted successfully",
      });

      setOpen(false);

      if (onDeleted) {
        onDeleted();
      }
    } catch (error) {
      console.error("Failed to delete workout:", error);
      toast({
        title: "Error",
        description: "Failed to delete workout. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Workout</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete &quot;{workoutTitle}&quot;? This
            action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
