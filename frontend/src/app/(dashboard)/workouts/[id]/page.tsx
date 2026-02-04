"use client";

import { useQuery } from "@/lib/apollo-hooks";
import { GET_WORKOUT } from "@/lib/graphql/workouts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Clock, Flame, Lock, Edit, Trash2, Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { DeleteWorkoutDialog } from "@/components/features/workout/delete-workout-dialog";

interface PageProps {
  params: {
    id: string;
  };
}

export default function WorkoutDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { data, loading, error } = useQuery(GET_WORKOUT, {
    variables: { id: params.id },
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !data?.workout) {
    return (
      <div className="container max-w-4xl py-8">
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">
              {error ? "Failed to load workout" : "Workout not found"}
            </p>
            <div className="flex justify-center mt-4">
              <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const workout = data.workout;
  const startTime = new Date(workout.startTime);
  const duration = workout.durationSeconds
    ? Math.floor(workout.durationSeconds / 60)
    : null;

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Main Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-2xl">{workout.title}</CardTitle>
                {workout.isPrivate && (
                  <Badge variant="secondary">
                    <Lock className="h-3 w-3 mr-1" />
                    Private
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{format(startTime, "PPP")}</span>
                <span>{format(startTime, "p")}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <DeleteWorkoutDialog
                workoutId={workout.id}
                workoutTitle={workout.title || "Untitled Workout"}
                onDeleted={() => router.push("/workouts")}
              >
                <Button variant="outline" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </DeleteWorkoutDialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {duration && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">{duration}</p>
                  <p className="text-xs text-muted-foreground">minutes</p>
                </div>
              </div>
            )}
            {workout.caloriesBurned && (
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">{workout.caloriesBurned}</p>
                  <p className="text-xs text-muted-foreground">calories</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{workout.exercises?.length || 0}</p>
                <p className="text-xs text-muted-foreground">exercises</p>
              </div>
            </div>
          </div>

          {/* Notes */}
          {workout.notes && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="font-semibold">Notes</h3>
                <p className="text-sm text-muted-foreground">{workout.notes}</p>
              </div>
            </>
          )}

          {/* Social Stats */}
          {!workout.isPrivate && (
            <>
              <Separator />
              <div className="flex items-center gap-4 text-sm">
                <span className="text-muted-foreground">
                  {workout.likeCount || 0} likes
                </span>
                <span className="text-muted-foreground">
                  {workout.commentCount || 0} comments
                </span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Exercises */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Exercises</h2>
        {workout.exercises && workout.exercises.length > 0 ? (
          <div className="space-y-3">
            {workout.exercises.map((workoutExercise: any, index: number) => (
              <Card key={workoutExercise.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {index + 1}. {workoutExercise.exercise.name}
                      </CardTitle>
                      {workoutExercise.exercise.category && (
                        <Badge variant="outline" className="mt-1">
                          {workoutExercise.exercise.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {workoutExercise.sets && (
                      <div>
                        <span className="text-muted-foreground">Sets:</span>{" "}
                        <span className="font-medium">{workoutExercise.sets}</span>
                      </div>
                    )}
                    {workoutExercise.reps && (
                      <div>
                        <span className="text-muted-foreground">Reps:</span>{" "}
                        <span className="font-medium">{workoutExercise.reps}</span>
                      </div>
                    )}
                    {workoutExercise.weightKg && (
                      <div>
                        <span className="text-muted-foreground">Weight:</span>{" "}
                        <span className="font-medium">
                          {workoutExercise.weightKg} kg
                        </span>
                      </div>
                    )}
                    {workoutExercise.durationSeconds && (
                      <div>
                        <span className="text-muted-foreground">Duration:</span>{" "}
                        <span className="font-medium">
                          {workoutExercise.durationSeconds}s
                        </span>
                      </div>
                    )}
                  </div>
                  {workoutExercise.notes && (
                    <div className="mt-3 text-sm text-muted-foreground">
                      {workoutExercise.notes}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">
                No exercises recorded
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Media */}
      {workout.mediaUrls && Array.isArray(workout.mediaUrls) && workout.mediaUrls.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Media</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {workout.mediaUrls.map((url: string, index: number) => (
              <Card key={index} className="overflow-hidden">
                <img
                  src={url}
                  alt={`Workout media ${index + 1}`}
                  className="w-full h-48 object-cover"
                />
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
