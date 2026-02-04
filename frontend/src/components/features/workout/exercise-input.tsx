"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, GripVertical } from "lucide-react";

interface Exercise {
  id: string;
  name: string;
  category?: string;
}

//Commit checking

export interface WorkoutExerciseData {
  exerciseId: string;
  sets?: number;
  reps?: number;
  weightKg?: number;
  durationSeconds?: number;
  orderIndex: number;
  notes?: string;
}

interface ExerciseInputProps {
  exercise: Exercise;
  orderIndex: number;
  onUpdate: (data: WorkoutExerciseData) => void;
  onRemove: () => void;
}

export function ExerciseInput({
  exercise,
  orderIndex,
  onUpdate,
  onRemove,
}: ExerciseInputProps) {
  const [sets, setSets] = useState<number | undefined>();
  const [reps, setReps] = useState<number | undefined>();
  const [weightKg, setWeightKg] = useState<number | undefined>();
  const [durationSeconds, setDurationSeconds] = useState<number | undefined>();
  const [notes, setNotes] = useState<string>("");

  const handleUpdate = () => {
    onUpdate({
      exerciseId: exercise.id,
      sets,
      reps,
      weightKg,
      durationSeconds,
      orderIndex,
      notes: notes || undefined,
    });
  };

  // Auto-update on change
  const handleChange = (field: string, value: any) => {
    const updated: WorkoutExerciseData = {
      exerciseId: exercise.id,
      sets,
      reps,
      weightKg,
      durationSeconds,
      orderIndex,
      notes: notes || undefined,
      [field]: value,
    };
    onUpdate(updated);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
            <div>
              <CardTitle className="text-lg">{exercise.name}</CardTitle>
              {exercise.category && (
                <Badge variant="outline" className="mt-1">
                  {exercise.category}
                </Badge>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`sets-${exercise.id}`}>Sets</Label>
            <Input
              id={`sets-${exercise.id}`}
              type="number"
              min="0"
              placeholder="3"
              value={sets || ""}
              onChange={(e) => {
                const value = e.target.value ? parseInt(e.target.value) : undefined;
                setSets(value);
                handleChange("sets", value);
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`reps-${exercise.id}`}>Reps</Label>
            <Input
              id={`reps-${exercise.id}`}
              type="number"
              min="0"
              placeholder="10"
              value={reps || ""}
              onChange={(e) => {
                const value = e.target.value ? parseInt(e.target.value) : undefined;
                setReps(value);
                handleChange("reps", value);
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`weight-${exercise.id}`}>Weight (kg)</Label>
            <Input
              id={`weight-${exercise.id}`}
              type="number"
              min="0"
              step="0.5"
              placeholder="20"
              value={weightKg || ""}
              onChange={(e) => {
                const value = e.target.value ? parseFloat(e.target.value) : undefined;
                setWeightKg(value);
                handleChange("weightKg", value);
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`duration-${exercise.id}`}>Duration (sec)</Label>
            <Input
              id={`duration-${exercise.id}`}
              type="number"
              min="0"
              placeholder="60"
              value={durationSeconds || ""}
              onChange={(e) => {
                const value = e.target.value ? parseInt(e.target.value) : undefined;
                setDurationSeconds(value);
                handleChange("durationSeconds", value);
              }}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor={`notes-${exercise.id}`}>Notes (optional)</Label>
          <Input
            id={`notes-${exercise.id}`}
            type="text"
            placeholder="e.g., Felt strong today"
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value);
              handleChange("notes", e.target.value || undefined);
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
