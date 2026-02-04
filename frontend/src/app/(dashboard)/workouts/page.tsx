"use client";

import { useQuery } from "@/lib/apollo-hooks";
import { GET_USER_WORKOUTS } from "@/lib/graphql/workouts";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Plus, Calendar, Clock } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default function WorkoutsPage() {
    const { data, loading, error } = useQuery(GET_USER_WORKOUTS, {
        variables: { page: 0, size: 10 },
    });

    if (loading) return <div>Loading workouts...</div>;
    if (error) return <div>Error loading workouts</div>;

    const workouts = data?.userWorkouts?.content || [];

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold md:text-2xl">Workouts</h1>
                <Link href="/workouts/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        New Workout
                    </Button>
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {workouts.map((workout: any) => (
                    <Link key={workout.id} href={`/workouts/${workout.id}`}>
                        <Card className="hover:bg-accent transition-colors cursor-pointer h-full">
                            <CardHeader>
                                <CardTitle>{workout.title}</CardTitle>
                                <CardDescription>
                                    {format(new Date(workout.startTime), "PPP")}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        <span>
                                            {workout.endTime
                                                ? `${Math.round(
                                                    (new Date(workout.endTime).getTime() -
                                                        new Date(workout.startTime).getTime()) /
                                                    60000
                                                )} mins`
                                                : "In Progress"}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <DumbbellIcon className="h-4 w-4" />
                                        <span>{workout.exercises?.length || 0} Exercises</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
                {workouts.length === 0 && (
                    <div className="col-span-full text-center text-muted-foreground">
                        No workouts found. Start tracking today!
                    </div>
                )}
            </div>
        </div>
    );
}

function DumbbellIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m6.5 6.5 11 11" />
            <path d="m21 21-1-1" />
            <path d="m3 3 1 1" />
            <path d="m18 22 4-4" />
            <path d="m2 6 4-4" />
            <path d="m3 10 7-7" />
            <path d="m14 21 7-7" />
        </svg>
    );
}
