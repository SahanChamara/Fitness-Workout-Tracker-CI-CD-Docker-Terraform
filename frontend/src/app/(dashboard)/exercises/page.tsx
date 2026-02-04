"use client";

import { useQuery } from "@/lib/apollo-hooks";
import { GET_EXERCISES } from "@/lib/graphql/exercises";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";

export default function ExercisesPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 500);

    const { data, loading, error } = useQuery(GET_EXERCISES, {
        variables: {
            page: 0,
            size: 20,
            filter: { name: debouncedSearch },
        },
    });

    if (loading) return <div>Loading exercises...</div>;
    if (error) return <div>Error loading exercises</div>;

    const exercises = data?.exercises?.content || [];

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <h1 className="text-lg font-semibold md:text-2xl">Exercise Library</h1>
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search exercises..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {exercises.map((exercise: any) => (
                    <Card key={exercise.id}>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <CardTitle className="text-base">{exercise.name}</CardTitle>
                                <Badge variant="outline">{exercise.difficultyLevel}</Badge>
                            </div>
                            <CardDescription>{exercise.muscleGroup}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="line-clamp-3 text-sm text-muted-foreground">
                                {exercise.description}
                            </p>
                            <div className="mt-4 flex gap-2">
                                <Badge variant="secondary">{exercise.equipment}</Badge>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {exercises.length === 0 && (
                    <div className="col-span-full text-center text-muted-foreground">
                        No exercises found matching your search.
                    </div>
                )}
            </div>
        </div>
    );
}
