import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { formatDate } from "@/lib/utils";
import { Edit, Trash2 } from "lucide-react";
import { deleteStory } from "@/lib/firebase/firestore";
import type { Story } from "@/lib/types";
import type { User } from "firebase/auth";
import { useState } from "react";

export default function StoryList({
  stories,
  user,
  onDelete,
}: {
  stories: Story[];
  user: User | null;
  onDelete?: (id: string) => void;
}) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (storyId: string) => {
    setIsDeleting(storyId);
    try {
      await deleteStory(storyId);
      onDelete?.(storyId);
    } catch (error) {
      console.error("Failed to delete story:", error);
    } finally {
      setIsDeleting(null);
    }
  };

  if (stories.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-100/50 to-white/30 dark:from-amber-900/20 dark:to-gray-900/50 backdrop-blur-xl rounded-3xl" />
          <div className="relative px-6 py-12">
            <h3 className="text-xl font-medium mb-2 text-amber-900 dark:text-amber-100">
              No stories yet
            </h3>
            <p className="text-amber-800/80 dark:text-amber-200/80 mb-6">
              Be the first to publish a story!
            </p>
            <Link href="/create-story">
              <Badge
                variant="outline"
                className="text-sm py-1.5 px-4 cursor-pointer border-amber-200 bg-amber-100/50 hover:bg-amber-200/50 text-amber-900 dark:border-amber-700 dark:bg-amber-900/50 dark:hover:bg-amber-800/50 dark:text-amber-100 transition-all"
              >
                Write a Story
              </Badge>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stories.map((story) => (
        <div
          key={story.id}
          className={`group relative ${
            story.status === "draft" ? "opacity-80" : ""
          }`}
        >
          {/* Card background with paper texture */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-white dark:from-amber-950 dark:to-gray-900 rounded-3xl shadow-lg shadow-amber-900/5 dark:shadow-amber-900/10 backdrop-blur-xl" />

          {/* Card content */}
          <div className="relative h-full flex flex-col rounded-3xl border border-amber-200/30 dark:border-amber-800/30 transition-transform duration-300 group-hover:scale-[1.02]">
            <Link href={`/story/${story.id}`} className="flex-1">
              <div className="px-6 pt-6">
                <h3 className="text-xl font-serif font-medium text-amber-900 dark:text-amber-100 line-clamp-2 mb-2">
                  {story.title}
                </h3>
                <div className="flex items-center text-sm text-amber-700/80 dark:text-amber-300/80">
                  <span>By {story.authorName}</span>
                </div>
              </div>
              <div className="px-6 py-4 flex-grow space-y-2">
                <p className="text-amber-800/70 dark:text-amber-200/70 line-clamp-4">
                  {story.description}
                </p>
                {story.status === "draft" && (
                  <Badge className="mt-2 bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 hover:bg-amber-200 dark:hover:bg-amber-800">
                    Draft
                  </Badge>
                )}
              </div>
            </Link>
            <div className="px-6 pb-6 flex justify-between items-center border-t border-amber-200/30 dark:border-amber-800/30 pt-4">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="border-amber-200/50 dark:border-amber-800/50 text-amber-700 dark:text-amber-300"
                >
                  {story.genre}
                </Badge>
                <span className="text-xs text-amber-600/60 dark:text-amber-400/60">
                  {formatDate(story.createdAt)}
                </span>
              </div>
              {user && story.authorId === user.uid && (
                <div className="flex items-center gap-2">
                  <Link href={`/write?id=${story.id}`}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-amber-700 dark:text-amber-300 hover:text-amber-800 dark:hover:text-amber-200 hover:bg-amber-100/50 dark:hover:bg-amber-900/50"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-red-100/50 dark:hover:bg-red-900/50"
                      >
                        <Trash2 className="h-4 w-4 text-red-500 dark:text-red-400" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-amber-200/30 dark:border-amber-800/30">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-amber-900 dark:text-amber-100">
                          Delete Story
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-amber-800/70 dark:text-amber-200/70">
                          Are you sure you want to delete "{story.title}"? This
                          action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-transparent border-amber-200/30 dark:border-amber-800/30 text-amber-900 dark:text-amber-100 hover:bg-amber-100/50 dark:hover:bg-amber-900/50">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(story.id)}
                          disabled={isDeleting === story.id}
                          className="bg-red-500 hover:bg-red-600 focus:ring-red-500"
                        >
                          {isDeleting === story.id ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
