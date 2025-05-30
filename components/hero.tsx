import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <div className="relative overflow-hidden">
      {/* Warm gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-100/80 via-amber-50/50 to-white/30 dark:from-amber-900/20 dark:via-amber-800/10 dark:to-gray-900/50 backdrop-blur-3xl" />

      {/* Decorative elements */}
      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute -left-1/4 top-0 h-[400px] w-[600px] rounded-full bg-gradient-to-br from-amber-200/40 to-orange-100/30 blur-3xl dark:from-amber-900/20 dark:to-orange-900/10" />
        <div className="absolute -right-1/4 bottom-0 h-[300px] w-[500px] rounded-full bg-gradient-to-br from-orange-100/40 to-amber-200/30 blur-3xl dark:from-orange-900/20 dark:to-amber-900/10" />
      </div>

      <div className="relative px-6 py-24 sm:py-32 lg:px-8">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-serif text-5xl md:text-6xl font-medium mb-6 bg-clip-text text-transparent bg-gradient-to-b from-amber-950 to-amber-700 dark:from-amber-200 dark:to-amber-400 animate-fade-in">
            Share Your Stories with the World
          </h1>
          <p className="text-xl md:text-2xl text-amber-800/80 dark:text-amber-200/80 mb-12 max-w-3xl mx-auto leading-relaxed font-light animate-fade-in-up">
            Athemaria is where stories come to life. Join our community of
            writers and readers, and let your imagination flourish.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up">
            <Link href="/create-story">
              <Button
                size="lg"
                className="rounded-2xl bg-amber-800 hover:bg-amber-700 text-amber-50 dark:bg-amber-700 dark:hover:bg-amber-600 px-8 h-12 text-lg shadow-lg shadow-amber-900/20 dark:shadow-amber-900/10 transition-all hover:scale-105"
              >
                Start Writing
              </Button>
            </Link>
            <Link href="/signup">
              <Button
                size="lg"
                variant="outline"
                className="rounded-2xl border-amber-800/20 dark:border-amber-200/20 hover:bg-amber-50/50 dark:hover:bg-amber-900/50 text-amber-900 dark:text-amber-100 px-8 h-12 text-lg backdrop-blur-sm transition-all hover:scale-105"
              >
                Join the Community
              </Button>
            </Link>
          </div>

          {/* Decorative book icon */}
          <div className="mt-16 flex justify-center opacity-80">
            <svg
              className="w-12 h-12 text-amber-800/30 dark:text-amber-200/30"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}
