"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
// Assuming Select components are available and follow this pattern.
// If not, standard HTML select will be used within the JSX.
// For this example, I'll proceed as if standard <select> is fine.
import { AlertCircle, BookOpen } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AuthCheck from "@/components/auth-check";

export default function CreateStoryPage() {
  const [title, setTitle] = useState("");
  // const [content, setContent] = useState(""); // content is not used in this form, it's for the /write page
  const [description, setDescription] = useState("");
  const [genre1, setGenre1] = useState("");
  const [genre2, setGenre2] = useState("");
  const [genre3, setGenre3] = useState("");
  const [tags, setTags] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { user } = useAuth();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError("You must be logged in to create a story");
      return;
    }

    if (!title || !description || !genre1) { // Check for title, description, and at least the first genre
      setError("Please fill out title, description, and select at least one genre.");
      return;
    }

    const selectedGenres: string[] = [];
    if (genre1) selectedGenres.push(genre1);
    if (genre2) selectedGenres.push(genre2);
    if (genre3) selectedGenres.push(genre3);

    const processedTags: string[] = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag !== "");

    localStorage.setItem(
      "pendingStory",
      JSON.stringify({
        title,
        description,
        genres: selectedGenres, // Use the new genres array
        tags: processedTags,    // Add the processed tags
        status: "draft" as const,
      })
    );

    router.push("/write");
  };

  return (
    <AuthCheck>
      <div className="min-h-screen bg-gradient-to-b from-amber-50/50 via-white to-white dark:from-amber-950/30 dark:via-gray-900 dark:to-gray-900">
        <div className="container relative mx-auto px-4 py-12">
          {/* Decorative elements */}
          <div
            className="absolute inset-0 pointer-events-none"
            aria-hidden="true"
          >
            <div className="absolute left-0 top-1/4 h-[300px] w-[400px] rounded-full bg-gradient-to-br from-amber-200/20 to-orange-100/10 blur-3xl dark:from-amber-900/10 dark:to-orange-900/5" />
            <div className="absolute right-0 bottom-1/4 h-[250px] w-[350px] rounded-full bg-gradient-to-br from-orange-100/20 to-amber-200/10 blur-3xl dark:from-orange-900/10 dark:to-amber-900/5" />
          </div>

          <div className="relative max-w-2xl mx-auto">
            <div className="rounded-3xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-amber-200/30 dark:border-amber-800/30 shadow-2xl">
              <div className="px-6 py-6 border-b border-amber-200/30 dark:border-amber-800/30">
                <h1 className="font-serif text-3xl font-medium text-amber-900 dark:text-amber-100">
                  Create a New Story
                </h1>
                <p className="mt-1.5 text-sm text-amber-800/80 dark:text-amber-200/80">
                  Share your creativity with the world
                </p>
              </div>

              <div className="p-6">
                {error && (
                  <Alert
                    variant="destructive"
                    className="mb-6 rounded-2xl border-red-500/20 bg-red-50/50 dark:bg-red-900/20 backdrop-blur-xl"
                  >
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="title"
                      className="text-sm font-medium text-amber-900 dark:text-amber-100"
                    >
                      Title
                    </Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter your story title"
                      required
                      className="rounded-xl border-amber-200/50 dark:border-amber-800/50 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl transition-colors focus:border-amber-500/50 dark:focus:border-amber-500/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="genre1"
                      className="text-sm font-medium text-amber-900 dark:text-amber-100"
                    >
                      Genre 1
                    </Label>
                    <select
                      id="genre1"
                      value={genre1}
                      onChange={(e) => setGenre1(e.target.value)}
                      required
                      className="w-full rounded-xl border-amber-200/50 dark:border-amber-800/50 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl transition-colors focus:border-amber-500/50 dark:focus:border-amber-500/50 p-2 text-sm text-foreground"
                    >
                      <option value="" className="text-muted-foreground">Select a genre</option>
                      {[
                        "Fantasy", "Sci-Fi", "Romance", "Mystery", "Thriller",
                        "Horror", "Historical", "Contemporary", "Young Adult",
                        "Adventure", "Literary Fiction"
                      ].map(g => <option key={g} value={g} className="text-foreground">{g}</option>)}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="genre2"
                      className="text-sm font-medium text-amber-900 dark:text-amber-100"
                    >
                      Genre 2 (Optional)
                    </Label>
                    <select
                      id="genre2"
                      value={genre2}
                      onChange={(e) => setGenre2(e.target.value)}
                      className="w-full rounded-xl border-amber-200/50 dark:border-amber-800/50 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl transition-colors focus:border-amber-500/50 dark:focus:border-amber-500/50 p-2 text-sm text-foreground"
                    >
                      <option value="" className="text-muted-foreground">Select a genre</option>
                      {[
                        "Fantasy", "Sci-Fi", "Romance", "Mystery", "Thriller",
                        "Horror", "Historical", "Contemporary", "Young Adult",
                        "Adventure", "Literary Fiction"
                      ].map(g => <option key={g} value={g} className="text-foreground">{g}</option>)}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="genre3"
                      className="text-sm font-medium text-amber-900 dark:text-amber-100"
                    >
                      Genre 3 (Optional)
                    </Label>
                    <select
                      id="genre3"
                      value={genre3}
                      onChange={(e) => setGenre3(e.target.value)}
                      className="w-full rounded-xl border-amber-200/50 dark:border-amber-800/50 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl transition-colors focus:border-amber-500/50 dark:focus:border-amber-500/50 p-2 text-sm text-foreground"
                    >
                      <option value="" className="text-muted-foreground">Select a genre</option>
                      {[
                        "Fantasy", "Sci-Fi", "Romance", "Mystery", "Thriller",
                        "Horror", "Historical", "Contemporary", "Young Adult",
                        "Adventure", "Literary Fiction"
                      ].map(g => <option key={g} value={g} className="text-foreground">{g}</option>)}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label
                      htmlFor="tags"
                      className="text-sm font-medium text-amber-900 dark:text-amber-100"
                    >
                      Tags (comma-separated)
                    </Label>
                    <Input
                      id="tags"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="e.g., magic, space opera, high school"
                      className="rounded-xl border-amber-200/50 dark:border-amber-800/50 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl transition-colors focus:border-amber-500/50 dark:focus:border-amber-500/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="description"
                      className="text-sm font-medium text-amber-900 dark:text-amber-100"
                    >
                      Story Description
                    </Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter a brief summary of your story..."
                      className="min-h-[100px] rounded-xl border-amber-200/50 dark:border-amber-800/50 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl transition-colors focus:border-amber-500/50 dark:focus:border-amber-500/50"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full rounded-xl bg-amber-800 hover:bg-amber-700 text-amber-50 dark:bg-amber-700 dark:hover:bg-amber-600 font-medium py-2.5 transition-colors shadow-lg shadow-amber-900/20 dark:shadow-amber-900/10"
                  >
                    Start Writing
                  </Button>
                </form>
              </div>
            </div>

            {/* Decorative book icon */}
            <div className="mt-8 flex justify-center opacity-60">
              <BookOpen className="h-8 w-8 text-amber-800/30 dark:text-amber-200/30" />
            </div>
          </div>
        </div>
      </div>
    </AuthCheck>
  );
}
