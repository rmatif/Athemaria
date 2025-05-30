import React from 'react';
import { Story } from '@/lib/types';
import { useDefaultCover } from '@/lib/hooks/use-default-cover';

interface StoryCardProps {
  story: Story;
  status?: 'nouveau' | 'in-progress' | 'termine';
  progress?: number; // Optional, 0-100
}

const StoryCard: React.FC<StoryCardProps> = ({ story, status, progress }) => {
  const { defaultCoverUrl } = useDefaultCover();
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-300 ease-in-out">
      <img
        src={story.coverImage || defaultCoverUrl}
        alt={`Cover for ${story.title}`}
        className="w-full aspect-[2/3] object-cover"
        onError={(e) => {
          e.currentTarget.src = defaultCoverUrl;
        }}
      />
      <div className="p-4">
        {status === 'nouveau' && (
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold bg-blue-100 text-blue-600 px-2 py-1 rounded-full">NEW</span> {/* Translated from "NOUVEAU" */}
              <p className="text-sm text-gray-500 mt-1">Completed</p> {/* Translated from "Terminé" */}
            </div>
            <i className="material-icons text-gray-400">more_horiz</i>
          </div>
        )}
        {status === 'in-progress' && progress !== undefined && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-gray-700">{progress}%</span>
              <i className="material-icons text-gray-400">more_horiz</i>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-orange-500 h-2 rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}
        {status === 'termine' && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-green-600">COMPLETED</span> {/* Translated from "TERMINÉ" */}
            <i className="material-icons text-gray-400">more_horiz</i>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryCard;
