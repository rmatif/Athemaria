'use client';

import React, { useState, useEffect } from 'react';
import type { Story } from '@/lib/types';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { toggleFavorite, isStoryFavorited } from '@/lib/firebase/firestore';

interface ContinueReadingCardProps {
  story: Story;
}

const ContinueReadingCard: React.FC<ContinueReadingCardProps> = ({
  story,
}) => {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (user) {
        const favorited = await isStoryFavorited(user.uid, story.id);
        setIsFavorite(favorited);
      }
    };

    checkFavoriteStatus();
  }, [user, story.id]);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user || isLoading) return;
    
    setIsLoading(true);
    try {
      await toggleFavorite(user.uid, story.id);
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative group">
      <Link href={`/story/${story.id}`}>
        <div className="block hover:no-underline focus:outline-none focus:ring-2 focus:ring-amber-500 rounded-lg transition-shadow hover:shadow-xl bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex items-center h-full">
          <div className="relative mr-4">
            <img
              src={story.coverImage || "/assets/cover.png"}
              alt={`Cover for ${story.title}`}
              className="w-24 h-36 object-cover rounded-lg"
            />
            {user && (
              <button
                onClick={handleFavoriteClick}
                disabled={isLoading}
                className="absolute top-2 right-2 p-1 rounded-full bg-white/80 hover:bg-white transition-all duration-200 shadow-md opacity-0 group-hover:opacity-100"
                aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <i className={`material-icons text-sm ${isFavorite ? 'text-red-500' : 'text-gray-400'} ${isLoading ? 'opacity-50' : ''}`}>
                  {isFavorite ? 'favorite' : 'favorite_border'}
                </i>
              </button>
            )}
          </div>
          <div className="flex-grow">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-200">{story.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{story.authorName}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Story</p>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
              <div
                className="bg-blue-500 dark:bg-blue-400 h-2.5 rounded-full"
                style={{ width: '0%' }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">0%</p>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ContinueReadingCard;
