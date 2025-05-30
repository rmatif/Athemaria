'use client';

import React, { useState, useEffect } from 'react';
import type { Story } from '@/lib/types';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { toggleFavorite, isStoryFavorited, toggleReadLater, isStoryInReadLater } from '@/lib/firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { useDefaultCover } from '@/lib/hooks/use-default-cover';

interface BookRecommendationCardProps {
  story: Story;
}

const BookRecommendationCard: React.FC<BookRecommendationCardProps> = ({
  story,
}) => {
  const { user } = useAuth();
  const { defaultCoverUrl } = useDefaultCover();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInReadLater, setIsInReadLater] = useState(false);
  const [isReadLaterLoading, setIsReadLaterLoading] = useState(false);

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (user) {
        const favorited = await isStoryFavorited(user.uid, story.id);
        setIsFavorite(favorited);
      }
    };

    const checkReadLaterStatus = async () => {
      if (user) {
        const inReadLater = await isStoryInReadLater(user.uid, story.id);
        setIsInReadLater(inReadLater);
      }
    };

    checkFavoriteStatus();
    checkReadLaterStatus();
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

  const handleReadLaterClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user || isReadLaterLoading) return;
    
    setIsReadLaterLoading(true);
    try {
      await toggleReadLater(user.uid, story.id);
      setIsInReadLater(!isInReadLater);
    } catch (error) {
      console.error('Error toggling read later:', error);
    } finally {
      setIsReadLaterLoading(false);
    }
  };

  return (
    <div className="relative group">
      <Link href={`/story/${story.id}`} className="block hover:no-underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg transition-shadow hover:shadow-xl">
        <Card className="rounded-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 ease-in-out">
          <img
            src={story.coverImage || defaultCoverUrl}
            alt={`Cover for ${story.title}`}
            className="w-full aspect-[2/3] object-cover"
            onError={(e) => {
              e.currentTarget.src = defaultCoverUrl;
            }}
          />
          <CardContent className="p-3">
            <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200 truncate">{story.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{story.authorName}</p>
          </CardContent>
        </Card>
      </Link>
      {user && (
        <>
          <button
            onClick={handleReadLaterClick}
            disabled={isReadLaterLoading}
            className="absolute top-2 left-2 p-1.5 rounded-full bg-white/80 hover:bg-white transition-all duration-200 shadow-md opacity-0 group-hover:opacity-100"
            aria-label={isInReadLater ? 'Remove from read later' : 'Add to read later'}
          >
            <i className={`material-icons text-sm ${isInReadLater ? 'text-blue-500' : 'text-gray-400'} ${isReadLaterLoading ? 'opacity-50' : ''}`}>
              {isInReadLater ? 'bookmark' : 'bookmark_border'}
            </i>
          </button>
          <button
            onClick={handleFavoriteClick}
            disabled={isLoading}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 hover:bg-white transition-all duration-200 shadow-md opacity-0 group-hover:opacity-100"
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <i className={`material-icons text-sm ${isFavorite ? 'text-red-500' : 'text-gray-400'} ${isLoading ? 'opacity-50' : ''}`}>
              {isFavorite ? 'favorite' : 'favorite_border'}
            </i>
          </button>
        </>
      )}
    </div>
  );
};

export default BookRecommendationCard;
