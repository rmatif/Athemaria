export type StoryStatus = "draft" | "published";

export interface Chapter {
  id: string;
  title: string;
  content: string;
  order: number;
}

export interface Story {
  id: string;
  title: string;
  chapters: Chapter[];
  description: string;
  genres: string[];
  tags: string[];
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
  status: StoryStatus;
  coverImage?: string; // Add this line
}

export interface StoryInput {
  title: string;
  chapters: Chapter[];
  description: string;
  genres: string[];
  tags: string[];
  authorId: string;
  authorName: string;
  createdAt: string;
  status: StoryStatus;
  coverImage?: string; // Add this line
}

export interface StoryUpdate {
  chapters?: Chapter[];
  description?: string;
  title?: string;
  genres?: string[];
  tags?: string[];
  status?: StoryStatus;
  updatedAt: string;
  coverImage?: string;
}

export interface UserStory {
  id: string;
  title: string;
  imageUrl: string;
  commentCount: number;
  averageRating: number;
}

export interface SocialLinks {
  x?: string;
  instagram?: string;
  tiktok?: string;
}

export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  bio: string;
  avatar: string;
  socialLinks?: SocialLinks;
  website?: string; // Add this line
  favorites?: string[]; // Array of story IDs that user has favorited
  readLater?: string[]; // Array of story IDs that user wants to read later
}

export interface Comment {
  id: string;
  storyId: string;
  userId: string;
  userName: string; // To display alongside the comment
  userAvatar?: string | null; // Optional: URL to user's avatar, can be null
  text: string;
  createdAt: string; // ISO string date
  updatedAt?: string; // Add this line (optional field)
}

export interface CommentInput {
  storyId: string;
  userId: string;
  userName: string;
  userAvatar?: string | null; // Can be null
  text: string;
}

export interface Rating {
  id: string; // Document ID
  storyId: string;
  userId: string;
  value: 1 | 2 | 3 | 4 | 5; // 5-star rating
}

export interface RatingInput {
  storyId: string;
  userId: string;
  value: 1 | 2 | 3 | 4 | 5;
}

export interface RatingStats {
  average: number;
  count: number;
}
