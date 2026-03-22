"use client";

import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import {
  Dumbbell,
  Activity,
  Users,
  TrendingUp,
  ArrowRight,
  Zap,
  Target,
  BarChart3,
} from "lucide-react";

const features = [
  {
    icon: Dumbbell,
    title: "Track Workouts",
    description:
      "Log every set, rep, and weight. See your progress over time with detailed workout history.",
  },
  {
    icon: BarChart3,
    title: "Monitor Progress",
    description:
      "Visualize your fitness journey with stats and insights that keep you motivated.",
  },
  {
    icon: Target,
    title: "Exercise Library",
    description:
      "Browse a curated library of exercises with muscle groups, equipment, and difficulty levels.",
  },
  {
    icon: Users,
    title: "Social Community",
    description:
      "Connect with friends, share workouts, and stay motivated together.",
  },
  {
    icon: Activity,
    title: "Activity Feed",
    description:
      "See what your friends are up to, like their workouts, and leave encouraging comments.",
  },
  {
    icon: Zap,
    title: "Build Routines",
    description:
      "Create custom routines and follow structured plans to reach your goals faster.",
  },
];

export default function Home() {
  const { user, loading } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Dumbbell className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              FitTracker
            </span>
          </Link>

          <nav className="flex items-center gap-3">
            {!loading && user ? (
              <Button asChild>
                <Link href="/dashboard">
                  Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Log in</Link>
                </Button>
                <Button asChild>
                  <Link href="/signup">Get Started</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Gradient background */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-40 right-0 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-40 left-0 h-[400px] w-[400px] rounded-full bg-primary/8 blur-3xl" />
        </div>

        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4 text-primary" />
              Your fitness journey starts here
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Track. Train.{" "}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Transform.
              </span>
            </h1>

            <p className="mt-6 text-lg leading-8 text-muted-foreground sm:text-xl">
              The all-in-one fitness platform to log workouts, track progress,
              and connect with a community that keeps you accountable.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" className="w-full sm:w-auto text-base px-8 h-12" asChild>
                <Link href="/signup">
                  Start Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto text-base px-8 h-12"
                asChild
              >
                <Link href="/login">I have an account</Link>
              </Button>
            </div>

            {/* Social proof */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-8 w-8 rounded-full border-2 border-background bg-muted"
                    />
                  ))}
                </div>
                <span>Join active users</span>
              </div>
              <div className="hidden h-4 w-px bg-border sm:block" />
              <span>Free to use</span>
              <div className="hidden h-4 w-px bg-border sm:block" />
              <span>Open source</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t bg-muted/30 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to crush your goals
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Built for lifters, runners, and everyone in between.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group relative rounded-2xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="relative mx-auto max-w-2xl overflow-hidden rounded-3xl bg-primary px-8 py-16 text-center text-primary-foreground shadow-xl sm:px-16">
            <div className="pointer-events-none absolute inset-0 -z-0">
              <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-white/10 blur-2xl" />
            </div>

            <div className="relative z-10">
              <Dumbbell className="mx-auto mb-6 h-12 w-12" />
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Ready to get started?
              </h2>
              <p className="mt-4 text-lg text-primary-foreground/80">
                Create your free account and start tracking your workouts today.
                No credit card required.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button
                  size="lg"
                  variant="secondary"
                  className="w-full sm:w-auto text-base px-8 h-12"
                  asChild
                >
                  <Link href="/signup">
                    Create Free Account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Dumbbell className="h-4 w-4" />
            <span>FitTracker &copy; {new Date().getFullYear()}</span>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/login" className="hover:text-foreground transition-colors">
              Log in
            </Link>
            <Link href="/signup" className="hover:text-foreground transition-colors">
              Sign up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
