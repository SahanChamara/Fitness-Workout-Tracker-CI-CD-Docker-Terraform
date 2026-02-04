"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@/lib/apollo-hooks";
import { CREATE_WORKOUT_MUTATION } from "@/lib/graphql/workouts";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Loader2, Plus } from "lucide-react";
import { ExerciseSelector } from "@/components/features/workout/exercise-selector";
import {
  ExerciseInput,
  type WorkoutExerciseData,
} from "@/components/features/workout/exercise-input";
import { useToast } from "@/hooks/use-toast";

const createWorkoutSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  notes: z.string().max(500).optional(),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().optional(),
  isPrivate: z.boolean().default(false),
});

type CreateWorkoutValues = z.infer<typeof createWorkoutSchema>;

interface Exercise {
  id: string;
  name: string;
  category?: string;
}

export default function CreateWorkoutPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [createWorkout, { loading }] = useMutation(CREATE_WORKOUT_MUTATION);

  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const [exercisesData, setExercisesData] = useState<
    Map<string, WorkoutExerciseData>
  >(new Map());
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);

  const form = useForm<CreateWorkoutValues>({
    resolver: zodResolver(createWorkoutSchema),
    defaultValues: {
      title: "",
      notes: "",
      startTime: new Date().toISOString().slice(0, 16),
      endTime: "",
      isPrivate: false,
    },
  });

  const handleExercisesChange = (exercises: Exercise[]) => {
    setSelectedExercises(exercises);
    // Remove data for exercises that were removed
    const newData = new Map(exercisesData);
    exercisesData.forEach((_, exerciseId) => {
      if (!exercises.some((e) => e.id === exerciseId)) {
        newData.delete(exerciseId);
      }
    });
    setExercisesData(newData);
  };

  const handleExerciseUpdate = (data: WorkoutExerciseData) => {
    setExercisesData(new Map(exercisesData.set(data.exerciseId, data)));
  };

  const handleRemoveExercise = (exerciseId: string) => {
    setSelectedExercises(selectedExercises.filter((e) => e.id !== exerciseId));
    const newData = new Map(exercisesData);
    newData.delete(exerciseId);
    setExercisesData(newData);
  };

  const onSubmit = async (values: CreateWorkoutValues) => {
    if (selectedExercises.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please add at least one exercise to your workout",
        variant: "destructive",
      });
      return;
    }

    try {
      // Build exercises array with orderIndex
      const exercises = selectedExercises.map((exercise, index) => {
        const data = exercisesData.get(exercise.id);
        return {
          exerciseId: exercise.id,
          sets: data?.sets,
          reps: data?.reps,
          weightKg: data?.weightKg,
          durationSeconds: data?.durationSeconds,
          orderIndex: index,
          notes: data?.notes,
        };
      });

      await createWorkout({
        variables: {
          input: {
            title: values.title,
            notes: values.notes,
            startTime: new Date(values.startTime).toISOString(),
            endTime: values.endTime
              ? new Date(values.endTime).toISOString()
              : null,
            isPrivate: values.isPrivate,
            exercises,
          },
        },
      });

      toast({
        title: "Success",
        description: "Workout created successfully",
      });
      router.push("/workouts");
    } catch (error) {
      console.error("Failed to create workout:", error);
      toast({
        title: "Error",
        description: "Failed to create workout. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Log Workout</CardTitle>
          <CardDescription>Record your latest session</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Morning Workout" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Add any notes about your workout..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time (Optional)</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="isPrivate"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="!mt-0">
                      Make workout private
                    </FormLabel>
                  </FormItem>
                )}
              />

              <Separator />

              {/* Exercise Selector Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Exercises</h3>
                    <p className="text-sm text-muted-foreground">
                      Add exercises to your workout
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowExerciseSelector(!showExerciseSelector)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {showExerciseSelector ? "Hide" : "Add"} Exercises
                  </Button>
                </div>

                {showExerciseSelector && (
                  <Card>
                    <CardContent className="pt-6">
                      <ExerciseSelector
                        selectedExercises={selectedExercises}
                        onExercisesChange={handleExercisesChange}
                      />
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Selected Exercises Input */}
              {selectedExercises.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-medium">
                    Workout Details ({selectedExercises.length} exercise
                    {selectedExercises.length !== 1 ? "s" : ""})
                  </h4>
                  {selectedExercises.map((exercise, index) => (
                    <ExerciseInput
                      key={exercise.id}
                      exercise={exercise}
                      orderIndex={index}
                      onUpdate={handleExerciseUpdate}
                      onRemove={() => handleRemoveExercise(exercise.id)}
                    />
                  ))}
                </div>
              )}

              {selectedExercises.length === 0 && !showExerciseSelector && (
                <Card className="border-dashed">
                  <CardContent className="py-8">
                    <p className="text-center text-muted-foreground">
                      No exercises added yet. Click &quot;Add Exercises&quot; to get
                      started.
                    </p>
                  </CardContent>
                </Card>
              )}

              <Separator />

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Workout
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
