'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/sidebar';
import UserStoryCard from '@/components/cards/user-story-card';
import { getUserStories } from '@/lib/firebase/firestore';
import { useAuth } from '@/lib/auth-context';
import type { UserStory } from '@/lib/types';
import { Button } from '@/components/ui/button';

const MyStoriesPage: React.FC = () => {
  const { user } = useAuth();
  const [userStories, setUserStories] = useState<UserStory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [storiesPerPage] = useState(12); // Show more stories per page than profile

  useEffect(() => {
    const fetchUserStories = async () => {
      if (user) {
        try {
          const stories = await getUserStories(user.uid);
          setUserStories(stories);
        } catch (error) {
          console.error('Error fetching user stories:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    fetchUserStories();
  }, [user]);

  // Calculate pagination
  const indexOfLastStory = currentPage * storiesPerPage;
  const indexOfFirstStory = indexOfLastStory - storiesPerPage;
  const currentStories = userStories.slice(indexOfFirstStory, indexOfLastStory);
  const totalPages = Math.ceil(userStories.length / storiesPerPage);

  const renderContent = () => {
    if (!user) {
      return (
        <div className="text-center py-12">
          <i className="material-icons text-6xl text-gray-300 dark:text-gray-600 mb-4">person_outline</i>
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">Please log in</h2>
          <p className="text-gray-600 dark:text-gray-400">You need to be logged in to view your stories.</p>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading your stories...</p>
        </div>
      );
    }

    if (userStories.length === 0) {
      return (
        <div className="text-center py-12">
          <i className="material-icons text-6xl text-gray-300 dark:text-gray-600 mb-4">book</i>
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No stories yet</h2>
          <p className="text-gray-600 dark:text-gray-400">Start writing your first story to see it here!</p>
        </div>
      );
    }

    return (
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          Your Stories ({userStories.length})
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {currentStories.map((story) => (
            <UserStoryCard
              key={story.id}
              id={story.id}
              title={story.title}
              imageUrl={story.imageUrl}
              commentCount={story.commentCount}
              averageRating={story.averageRating}
            />
          ))}
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-4 mt-8">
            <Button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              variant="outline"
            >
              Previous
            </Button>
            <span className="flex items-center text-gray-700 dark:text-gray-300">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              variant="outline"
            >
              Next
            </Button>
          </div>
        )}
      </section>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">My Stories</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Stories you've written and published
          </p>
        </header>

        {renderContent()}
      </main>
    </div>
  );
};

export default MyStoriesPage;
