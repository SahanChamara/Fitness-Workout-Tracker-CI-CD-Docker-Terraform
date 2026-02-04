"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { GET_EXERCISES } from "@/lib/graphql/exercises";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, X, Loader2 } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

interface Exercise {
  id: string;
  name: string;
  category: string;
  description?: string;
  muscleGroup?: string;
  equipment?: string;
  difficultyLevel?: string;
}

//changes

interface ExerciseSelectorProps {
  selectedExercises: Exercise[];
  onExercisesChange: (exercises: Exercise[]) => void;
}

export function ExerciseSelector({
  selectedExercises,
  onExercisesChange,
}: ExerciseSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);

  const { data, loading, error } = useQuery(GET_EXERCISES, {
    variables: {
      query: debouncedSearch || undefined,
    },
    skip: !debouncedSearch && searchQuery.length > 0,
  });

  const exercises: Exercise[] = data?.exercises || [];

  const toggleExercise = (exercise: Exercise) => {
    const isSelected = selectedExercises.some((e) => e.id === exercise.id);
    if (isSelected) {
      onExercisesChange(selectedExercises.filter((e) => e.id !== exercise.id));
    } else {
      onExercisesChange([...selectedExercises, exercise]);
    }
  };

  const removeExercise = (exerciseId: string) => {
    onExercisesChange(selectedExercises.filter((e) => e.id !== exerciseId));
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search exercises..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Selected Exercises */}
      {selectedExercises.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">
            Selected ({selectedExercises.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedExercises.map((exercise) => (
              <Badge
                key={exercise.id}
                variant="secondary"
                className="pr-1 gap-1"
              >
                {exercise.name}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => removeExercise(exercise.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Exercise List */}
      <div className="space-y-2">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && (
          <Card>
            <CardContent className="py-4">
              <p className="text-sm text-destructive">
                Failed to load exercises. Please try again.
              </p>
            </CardContent>
          </Card>
        )}

        {!loading && !error && debouncedSearch && exercises.length === 0 && (
          <Card>
            <CardContent className="py-4">
              <p className="text-sm text-muted-foreground text-center">
                No exercises found for &quot;{debouncedSearch}&quot;
              </p>
            </CardContent>
          </Card>
        )}

        {!loading && !error && exercises.length > 0 && (
          <div className="max-h-[400px] overflow-y-auto space-y-2 rounded-md border p-2">
            {exercises.map((exercise) => {
              const isSelected = selectedExercises.some(
                (e) => e.id === exercise.id
              );
              return (
                <Card
                  key={exercise.id}
                  className={`cursor-pointer transition-colors hover:bg-accent ${
                    isSelected ? "border-primary bg-accent/50" : ""
                  }`}
                  onClick={() => toggleExercise(exercise)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{exercise.name}</h4>
                        <div className="flex gap-2 mt-1">
                          {exercise.category && (
                            <Badge variant="outline" className="text-xs">
                              {exercise.category}
                            </Badge>
                          )}
                          {exercise.muscleGroup && (
                            <Badge variant="outline" className="text-xs">
                              {exercise.muscleGroup}
                            </Badge>
                          )}
                          {exercise.difficultyLevel && (
                            <Badge variant="outline" className="text-xs">
                              {exercise.difficultyLevel}
                            </Badge>
                          )}
                        </div>
                        {exercise.description && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {exercise.description}
                          </p>
                        )}
                      </div>
                      {isSelected && (
                        <Badge variant="default" className="ml-2">
                          Selected
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {!loading && !error && !debouncedSearch && (
          <Card>
            <CardContent className="py-8">
              <p className="text-sm text-muted-foreground text-center">
                Start typing to search for exercises
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
