"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { createStory, updateStory, getStory } from "@/lib/firebase/firestore";
import { Chapter } from "@/lib/types"; // Import Chapter type
import { v4 as uuidv4 } from "uuid"; // Import uuid
import Editor from "../create-story/editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Import Input for chapter title
import { AlertCircle, BookOpen, Save, PlusCircle, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AuthCheck from "@/components/auth-check";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function WritePage() {
  // const [content, setContent] = useState(""); // Removed content state
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number | null>(
    null
  );
  const [currentChapterTitle, setCurrentChapterTitle] = useState<string>("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  // const [story, setStory] = useState<any>(null); // Replaced by individual metadata states

  // New state variables for story metadata
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [storyGenres, setStoryGenres] = useState<string[]>([]); // Holds the actual story genres
  const [storyTags, setStoryTags] = useState<string[]>([]);   // Holds the actual story tags

  // New state variables for UI interaction with genres and tags
  const [genre1, setGenre1] = useState<string>("");
  const [genre2, setGenre2] = useState<string>("");
  const [genre3, setGenre3] = useState<string>("");
  const [tagsInput, setTagsInput] = useState<string>("");


  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const storyId = searchParams.get("id");

  useEffect(() => {
    if (storyId) {
      const loadStory = async () => {
        try {
          const loadedStory = await getStory(storyId);
          if (loadedStory && loadedStory.authorId === user?.uid) {
            // setStory(loadedStory); // No longer storing the whole story object in one state

            setTitle(loadedStory.title || "");
            setDescription(loadedStory.description || "");
            const currentGenres = loadedStory.genres || [];
            setStoryGenres(currentGenres);
            setGenre1(currentGenres[0] || "");
            setGenre2(currentGenres[1] || "");
            setGenre3(currentGenres[2] || "");
            const currentTags = loadedStory.tags || [];
            setStoryTags(currentTags);
            setTagsInput(currentTags.join(", "));

            if (loadedStory.chapters && loadedStory.chapters.length > 0) {
              setChapters(loadedStory.chapters);
              setCurrentChapterIndex(0);
              setCurrentChapterTitle(loadedStory.chapters[0].title);
            } else {
              const defaultChapter: Chapter = {
                id: uuidv4(),
                title: "Chapter 1",
                content: "", // Old loadedStory.content is not applicable here directly
                order: 1,
              };
              setChapters([defaultChapter]);
              setCurrentChapterIndex(0);
              setCurrentChapterTitle(defaultChapter.title);
            }
          } else if (!loadedStory && storyId) {
             setError("Failed to load the story. It might not exist or you may not have permission.");
          }
        } catch (err: any) {
          setError("Failed to load the story: " + (err.message || "Unknown error"));
        }
      };
      loadStory();
    }
  }, [storyId, user?.uid]);

  // Effect for initializing a new story (no storyId)
  useEffect(() => {
    if (!storyId && user?.uid) { // For new stories
      const pendingStoryString = localStorage.getItem("pendingStory");
      if (pendingStoryString) {
        const pendingStoryData = JSON.parse(pendingStoryString);
        setTitle(pendingStoryData.title || "");
        setDescription(pendingStoryData.description || "");
        const currentGenres = pendingStoryData.genres || [];
        setStoryGenres(currentGenres);
        setGenre1(currentGenres[0] || "");
        setGenre2(currentGenres[1] || "");
        setGenre3(currentGenres[2] || "");
        const currentTags = pendingStoryData.tags || [];
        setStoryTags(currentTags);
        setTagsInput(currentTags.join(", "));
      }

      // Initialize with a default chapter if chapters aren't already set (e.g. from pendingStoryData or if it was empty)
      // This part of the logic might need adjustment if pendingStoryData could also contain chapters.
      // For now, assuming chapters are always initialized fresh or loaded from DB for existing stories.
      if (chapters.length === 0) {
      const defaultChapter: Chapter = {
        id: uuidv4(),
        title: "Chapter 1",
        content: "",
        order: 1,
      };
      setChapters([defaultChapter]);
      setCurrentChapterIndex(0);
      setCurrentChapterTitle(defaultChapter.title);
    }
    }
  }, [storyId, user?.uid, chapters.length]); // Added chapters.length to dependencies

  const handleSave = async (status: "draft" | "published") => {
    if (!user || chapters.length === 0 || currentChapterIndex === null) {
      setError("Cannot save: No user, no chapters, or no chapter selected.");
      return;
    }

    // Ensure all chapters have titles
    const chaptersWithTitles = chapters.map((chap, index) => ({
      ...chap,
      title: chap.title || `Chapter ${index + 1}`,
      order: index + 1, // Ensure order is sequential before saving
    }));
    setChapters(chaptersWithTitles);


    setIsSaving(true);
    setError("");

    // Process genres and tags from UI state
    const finalGenres: string[] = [];
    if (genre1) finalGenres.push(genre1);
    if (genre2) finalGenres.push(genre2);
    if (genre3) finalGenres.push(genre3);

    const finalTags: string[] = tagsInput
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag !== "");

    // Validation
    if (!title.trim()) {
      setError("Story title cannot be empty.");
      setIsSaving(false);
      return;
    }
    if (finalGenres.length === 0) {
      setError("Please select at least one genre.");
      setIsSaving(false);
      return;
    }

    try {
      let newStoryId = storyId; // For navigation after creation
      if (storyId) {
        // Update existing story
        const storyUpdateData = { // Explicitly StoryUpdate type if defined with all fields
          title: title.trim(),
          description: description.trim(),
          genres: finalGenres,
          tags: finalTags,
          chapters: chaptersWithTitles,
          status,
          updatedAt: new Date().toISOString(),
        };
        await updateStory(storyId, storyUpdateData);
      } else {
        // Create new story
        const newStoryData = { // Explicitly StoryInput type if defined with all fields
          title: title.trim(),
          description: description.trim(),
          genres: finalGenres,
          tags: finalTags,
          chapters: chaptersWithTitles,
          status,
          authorId: user.uid,
          authorName: user.displayName || "Anonymous",
          createdAt: new Date().toISOString(),
        };
        newStoryId = await createStory(newStoryData); // createStory should return the new ID
      }

      localStorage.removeItem("pendingStory"); // Clear pending metadata
      // Navigate to the story page using the potentially new story ID
      router.push(status === "published" ? `/story/${newStoryId}` : "/");
    } catch (err: any) {
      setError(err.message || "Failed to save the story.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AuthCheck>
      <div className="min-h-screen bg-gradient-to-b from-amber-50/50 via-white to-white dark:from-amber-950/30 dark:via-gray-900 dark:to-gray-900">
        <div className="relative">
          {/* Decorative elements */}
          <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
            <div className="absolute left-0 top-1/4 h-[300px] w-[400px] rounded-full bg-gradient-to-br from-amber-200/20 to-orange-100/10 blur-3xl dark:from-amber-900/10 dark:to-orange-900/5" />
            <div className="absolute right-0 bottom-1/4 h-[250px] w-[350px] rounded-full bg-gradient-to-br from-orange-100/20 to-amber-200/10 blur-3xl dark:from-orange-900/10 dark:to-amber-900/5" />
          </div>

          {/* Sticky header */}
          <header className="sticky top-0 z-10 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-amber-200/30 dark:border-amber-800/30">
            <div className="container mx-auto px-4 py-4">
              <div className="flex justify-between items-center">
                <h1 className="font-serif text-2xl font-medium text-amber-900 dark:text-amber-100">
                  {storyId ? "Edit Story" : "Write Your Story"}
                </h1>
                <div className="flex items-center gap-4">
                  <Button
                    onClick={() => handleSave("draft")}
                    variant="outline"
                    className="border-amber-200/50 dark:border-amber-800/50 text-amber-900 dark:text-amber-100 hover:bg-amber-100/50 dark:hover:bg-amber-900/50"
                    disabled={isSaving}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Draft
                  </Button>
                  <Button
                    onClick={() => handleSave("published")}
                    className="bg-amber-800 hover:bg-amber-700 text-amber-50 dark:bg-amber-700 dark:hover:bg-amber-600 shadow-lg shadow-amber-900/20 dark:shadow-amber-900/10"
                    disabled={isSaving}
                  >
                    {isSaving ? "Saving..." : "Publish"}
                  </Button>
                </div>
              </div>
            </div>
          </header>

          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
              {error && (
                <Alert
                  variant="destructive"
                  className="mb-6 rounded-2xl border-red-500/20 bg-red-50/50 dark:bg-red-900/20 backdrop-blur-xl"
                >
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Story Metadata Inputs */}
              <div className="mb-8 p-6 rounded-3xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg border border-amber-200/40 dark:border-amber-800/40 shadow-xl space-y-6">
                <h2 className="text-xl font-semibold text-amber-800 dark:text-amber-200 font-serif">Story Details</h2>
                
                <div className="space-y-2">
                  <Label htmlFor="storyTitle" className="text-sm font-medium text-amber-900 dark:text-amber-100">Title</Label>
                  <Input
                    id="storyTitle"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter your story title"
                    required
                    className="rounded-xl border-amber-200/50 dark:border-amber-800/50 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl text-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="storyDescription" className="text-sm font-medium text-amber-900 dark:text-amber-100">Description</Label>
                  <Textarea
                    id="storyDescription"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter a brief summary of your story..."
                    className="min-h-[100px] rounded-xl border-amber-200/50 dark:border-amber-800/50 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl text-foreground"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="genre1" className="text-sm font-medium text-amber-900 dark:text-amber-100">Genre 1</Label>
                    <select
                      id="genre1"
                      value={genre1}
                      onChange={(e) => setGenre1(e.target.value)}
                      required
                      className="w-full rounded-xl border-amber-200/50 dark:border-amber-800/50 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl p-2 text-sm text-foreground"
                    >
                      <option value="" className="text-muted-foreground">Select a genre</option>
                      {["Fantasy", "Sci-Fi", "Romance", "Mystery", "Thriller", "Horror", "Historical", "Contemporary", "Young Adult", "Adventure", "Literary Fiction"].map(g => <option key={g} value={g} className="text-foreground">{g}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="genre2" className="text-sm font-medium text-amber-900 dark:text-amber-100">Genre 2 (Optional)</Label>
                    <select
                      id="genre2"
                      value={genre2}
                      onChange={(e) => setGenre2(e.target.value)}
                      className="w-full rounded-xl border-amber-200/50 dark:border-amber-800/50 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl p-2 text-sm text-foreground"
                    >
                      <option value="" className="text-muted-foreground">Select a genre</option>
                      {["Fantasy", "Sci-Fi", "Romance", "Mystery", "Thriller", "Horror", "Historical", "Contemporary", "Young Adult", "Adventure", "Literary Fiction"].map(g => <option key={g} value={g} className="text-foreground">{g}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="genre3" className="text-sm font-medium text-amber-900 dark:text-amber-100">Genre 3 (Optional)</Label>
                    <select
                      id="genre3"
                      value={genre3}
                      onChange={(e) => setGenre3(e.target.value)}
                      className="w-full rounded-xl border-amber-200/50 dark:border-amber-800/50 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl p-2 text-sm text-foreground"
                    >
                      <option value="" className="text-muted-foreground">Select a genre</option>
                      {["Fantasy", "Sci-Fi", "Romance", "Mystery", "Thriller", "Horror", "Historical", "Contemporary", "Young Adult", "Adventure", "Literary Fiction"].map(g => <option key={g} value={g} className="text-foreground">{g}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tagsInput" className="text-sm font-medium text-amber-900 dark:text-amber-100">Tags (comma-separated)</Label>
                  <Input
                    id="tagsInput"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="e.g., magic, space opera, high school"
                    className="rounded-xl border-amber-200/50 dark:border-amber-800/50 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl text-foreground"
                  />
                </div>
              </div>

              {/* Chapter Management UI */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 space-y-4">
                  <h2 className="text-xl font-semibold text-amber-800 dark:text-amber-200 font-serif">Chapters</h2>
                  <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                    {chapters.map((chapter, index) => (
                      <div
                        key={chapter.id}
                        className={`p-3 rounded-lg cursor-pointer transition-all
                                  ${currentChapterIndex === index
                                    ? "bg-amber-100 dark:bg-amber-800 shadow-md"
                                    : "bg-white/50 dark:bg-gray-800/50 hover:bg-amber-50 dark:hover:bg-amber-900"
                                  }`}
                        onClick={() => {
                          setCurrentChapterIndex(index);
                          setCurrentChapterTitle(chapter.title);
                        }}
                      >
                        <p className="font-medium text-sm text-amber-900 dark:text-amber-100 truncate">
                          {chapter.title || `Chapter ${index + 1}`}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {chapter.content?.substring(0,30) || "Empty"}...
                        </p>
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={() => {
                      const newChapter: Chapter = {
                        id: uuidv4(),
                        title: `Chapter ${chapters.length + 1}`,
                        content: "",
                        order: chapters.length + 1,
                      };
                      setChapters([...chapters, newChapter]);
                      setCurrentChapterIndex(chapters.length);
                      setCurrentChapterTitle(newChapter.title);
                    }}
                    variant="outline"
                    className="w-full border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300"
                  >
                    <PlusCircle className="w-4 h-4 mr-2" /> Add New Chapter
                  </Button>
                </div>

                <div className="md:col-span-2 space-y-4">
                  {currentChapterIndex !== null && chapters[currentChapterIndex] && (
                    <>
                      <Input
                        placeholder="Chapter Title"
                        value={currentChapterTitle}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                          const newTitle = e.target.value;
                          setCurrentChapterTitle(newTitle);
                          const updatedChapters = chapters.map((chap, index) =>
                            index === currentChapterIndex
                              ? { ...chap, title: newTitle }
                              : chap
                          );
                          setChapters(updatedChapters);
                        }}
                        className="text-lg font-semibold text-foreground"
                      />
                       <div className="flex space-x-2 mb-2">
                        <Button
                          onClick={() => { // Delete Chapter
                            if (chapters.length > 1 && currentChapterIndex !== null) {
                              const updatedChapters = chapters.filter((_, index) => index !== currentChapterIndex)
                                .map((chap, idx) => ({ ...chap, order: idx + 1 })); // Re-order
                              setChapters(updatedChapters);
                              if (updatedChapters.length > 0) {
                                const newIndex = Math.max(0, currentChapterIndex -1);
                                setCurrentChapterIndex(newIndex);
                                setCurrentChapterTitle(updatedChapters[newIndex].title);
                              } else {
                                // This case should ideally not be reached if we enforce min 1 chapter
                                // Or, re-initialize with a default chapter
                                const defaultChapter: Chapter = { id: uuidv4(), title: "Chapter 1", content: "", order: 1 };
                                setChapters([defaultChapter]);
                                setCurrentChapterIndex(0);
                                setCurrentChapterTitle(defaultChapter.title);
                              }
                            }
                          }}
                          variant="destructive"
                          size="sm"
                          disabled={chapters.length <= 1 || currentChapterIndex === null}
                        >
                          <Trash2 className="w-4 h-4 mr-1 text-foreground" />
                          <span className="text-foreground">Delete</span>
                        </Button>
                         <Button // Move Up
                            onClick={() => {
                                if (currentChapterIndex !== null && currentChapterIndex > 0) {
                                    const newChapters = [...chapters];
                                    const temp = newChapters[currentChapterIndex];
                                    newChapters[currentChapterIndex] = newChapters[currentChapterIndex - 1];
                                    newChapters[currentChapterIndex - 1] = temp;
                                    // Update orders
                                    newChapters[currentChapterIndex].order = currentChapterIndex + 1;
                                    newChapters[currentChapterIndex - 1].order = currentChapterIndex;
                                    setChapters(newChapters);
                                    setCurrentChapterIndex(currentChapterIndex - 1);
                                }
                            }}
                            variant="outline"
                            size="sm"
                            disabled={currentChapterIndex === null || currentChapterIndex === 0}
                        >
                            <ArrowUp className="w-4 h-4 mr-1 text-foreground" />
                            <span className="text-foreground">Up</span>
                        </Button>
                        <Button // Move Down
                            onClick={() => {
                                if (currentChapterIndex !== null && currentChapterIndex < chapters.length - 1) {
                                    const newChapters = [...chapters];
                                    const temp = newChapters[currentChapterIndex];
                                    newChapters[currentChapterIndex] = newChapters[currentChapterIndex + 1];
                                    newChapters[currentChapterIndex + 1] = temp;
                                    // Update orders
                                    newChapters[currentChapterIndex].order = currentChapterIndex + 1;
                                    newChapters[currentChapterIndex + 1].order = currentChapterIndex + 2;
                                     // Correct all orders after swap
                                    const reorderedChapters = newChapters.map((chap, idx) => ({ ...chap, order: idx + 1 }));
                                    setChapters(reorderedChapters);
                                    setCurrentChapterIndex(currentChapterIndex + 1);
                                }
                            }}
                            variant="outline"
                            size="sm"
                            disabled={currentChapterIndex === null || currentChapterIndex === chapters.length - 1}
                        >
                            <ArrowDown className="w-4 h-4 mr-1 text-foreground" />
                            <span className="text-foreground">Down</span>
                        </Button>
                      </div>
                    </>
                  )}
                  <div className="rounded-3xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-amber-200/30 dark:border-amber-800/30 shadow-2xl">
                    <Editor
                      value={
                        currentChapterIndex !== null && chapters[currentChapterIndex]
                          ? chapters[currentChapterIndex].content
                          : ""
                      }
                      onChange={(newContent) => {
                        if (currentChapterIndex !== null) {
                          const updatedChapters = chapters.map((chap, index) =>
                            index === currentChapterIndex
                              ? { ...chap, content: newContent }
                              : chap
                          );
                          setChapters(updatedChapters);
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
              {/* Decorative book icon */}
              <div className="mt-8 flex justify-center opacity-60">
                <BookOpen className="h-8 w-8 text-amber-800/30 dark:text-amber-200/30" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthCheck>
  );
}
