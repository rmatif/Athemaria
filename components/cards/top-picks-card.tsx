import React from 'react';
import type { Story } from '@/lib/types';

interface TopPicksCardProps {
  type: 'multi-cover' | 'month-highlight' | 'icon-highlight';
  story?: Story; // Optional story for dynamic content
  // Props for static/placeholder content, kept for flexibility
  title?: string;
  description?: string;
  month?: string; // For month-highlight
  icon?: string; // For icon-highlight (Material icon name)
  bgColor?: string;
  textColor?: string;
  iconBgColor?: string;
}

const TopPicksCard: React.FC<TopPicksCardProps> = ({
  type,
  story,
  title: staticTitle, // Renamed to avoid conflict with story.title
  description: staticDescription, // Renamed
  month,
  icon,
  bgColor,
  textColor,
  iconBgColor,
}) => {
  if (type === 'multi-cover') {
    // Use story data if available, otherwise fallback to static props or generic text
    const displayTitle = story?.title || staticTitle || "Featured Collection";
    const displayDescription = story?.description || staticDescription || "Check out these interesting stories.";
    // Truncate description if it's from story.description and too long
    const truncatedDescription = displayDescription.length > 100 ? `${displayDescription.substring(0, 97)}...` : displayDescription;

    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-2 gap-2 mb-4">
          <img src="https://i.postimg.cc/W3S2PT7P/fa04045a-41fe-4adc-bc0e-8013788873b8.png" alt={displayTitle} className="rounded w-full aspect-[2/3] object-cover" />
          <img src="https://i.postimg.cc/W3S2PT7P/fa04045a-41fe-4adc-bc0e-8013788873b8.png" alt={displayTitle} className="rounded w-full aspect-[2/3] object-cover" />
          <img src="https://i.postimg.cc/W3S2PT7P/fa04045a-41fe-4adc-bc0e-8013788873b8.png" alt={displayTitle} className="rounded w-full aspect-[2/3] object-cover" />
          <img src="https://i.postimg.cc/W3S2PT7P/fa04045a-41fe-4adc-bc0e-8013788873b8.png" alt={displayTitle} className="rounded w-full aspect-[2/3] object-cover" />
        </div>
        <h3 className="font-semibold text-lg text-gray-900 mb-1">{displayTitle}</h3>
        <p className="text-sm text-gray-600">{truncatedDescription}</p>
      </div>
    );
  }

  if (type === 'month-highlight') {
    // This variant typically uses static text, but can incorporate story if needed
    const displayTitle = staticTitle || "Highlight of the Month";
    const displayDescription = staticDescription || "Discover something new and exciting.";

    return (
      <div className={`${bgColor} p-6 rounded-lg shadow-md flex flex-col justify-between h-full`}>
        <div>
          <span className={`text-5xl font-bold ${textColor}`}>{month}</span>
        </div>
        <div>
          <h3 className={`font-semibold text-lg ${textColor} mb-1`}>{displayTitle}</h3>
          <p className={`text-sm ${textColor}`}>{displayDescription}</p>
        </div>
      </div>
    );
  }

  if (type === 'icon-highlight') {
    // This variant typically uses static text
    const displayTitle = staticTitle || "Special Feature";
    const displayDescription = staticDescription || "Check out this special highlight.";
    return (
      <div className={`${bgColor} p-6 rounded-lg shadow-md flex flex-col items-center text-center h-full`}>
        <div className={`w-16 h-16 ${iconBgColor} rounded-full flex items-center justify-center mb-4`}>
          <i className="material-icons text-white text-3xl">{icon}</i>
        </div>
        <h3 className={`font-bold text-xl ${textColor} mb-2`}>{displayTitle}</h3>
        <p className={`text-sm ${textColor}`}>{displayDescription}</p>
      </div>
    );
  }

  return null;
};

export default TopPicksCard;
