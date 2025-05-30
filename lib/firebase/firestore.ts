import { db } from "./config";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  query,
  orderBy,
  limit,
  updateDoc,
  deleteDoc,
  setDoc,
  type DocumentData,
  Timestamp,
  where,
} from "firebase/firestore";
import type {
  Story,
  StoryInput,
  StoryUpdate,
  UserProfile,
  Comment,
  CommentInput,
  Rating,
  RatingInput,
  RatingStats as ImportedRatingStats,
  UserStory,
} from "../types";

export async function createStory(storyData: StoryInput): Promise<string> { 
  try {
    const dataToSave = {
      ...storyData,
      chapters: storyData.chapters || [],
      coverImage: storyData.coverImage || "/assets/cover.png", // Use correct default cover image
    };
    const docRef = await addDoc(collection(db, "stories"), dataToSave);
    return docRef.id;
  } catch (error) {
    console.error("Error adding story: ", error);
    throw new Error("Failed to create story");
  }
}

export async function updateComment(
  commentId: string,
  newText: string,
  userId: string
): Promise<void> {
  console.log(`[firestore.ts] Attempting to update comment ${commentId} by user ${userId} with new text: "${newText}"`);
  const commentRef = doc(db, "comments", commentId);
  try {
    const commentSnap = await getDoc(commentRef);

    if (!commentSnap.exists()) {
      console.error(`[firestore.ts] Comment ${commentId} not found for update.`);
      throw new Error("Comment not found.");
    }

    const commentData = commentSnap.data();
    if (commentData.userId !== userId) {
      console.error(`[firestore.ts] User ${userId} does not have permission to update comment ${commentId} owned by ${commentData.userId}.`);
      throw new Error("You do not have permission to update this comment.");
    }

    await updateDoc(commentRef, {
      text: newText,
      updatedAt: Timestamp.now().toMillis().toString(),
    });
    console.log(`[firestore.ts] Comment ${commentId} updated successfully by user ${userId}.`);
  } catch (error) {
    console.error(`[firestore.ts] Error updating comment ${commentId}:`, error);
    if (error instanceof Error && (error.message === "Comment not found." || error.message === "You do not have permission to update this comment.")) {
        throw error;
    }
    throw new Error(`Failed to update comment. Firestore error: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function deleteComment(
  commentId: string,
  userId: string
): Promise<void> {
  console.log(`[firestore.ts] Attempting to delete comment ${commentId} by user ${userId}.`);
  const commentRef = doc(db, "comments", commentId);
  try {
    const commentSnap = await getDoc(commentRef);

    if (!commentSnap.exists()) {
      console.warn(`[firestore.ts] Comment ${commentId} not found for delete. Might have already been deleted.`);
      return; 
    }

    const commentData = commentSnap.data();
    if (commentData.userId !== userId) {
      console.error(`[firestore.ts] User ${userId} does not have permission to delete comment ${commentId} owned by ${commentData.userId}.`);
      throw new Error("You do not have permission to delete this comment.");
    }

    await deleteDoc(commentRef);
    console.log(`[firestore.ts] Comment ${commentId} deleted successfully by user ${userId}.`);
  } catch (error) {
    console.error(`[firestore.ts] Error deleting comment ${commentId}:`, error);
     if (error instanceof Error && error.message === "You do not have permission to delete this comment.") {
        throw error;
    }
    throw new Error(`Failed to delete comment. Firestore error: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function setRating(ratingData: RatingInput): Promise<void> {
  const { storyId, userId, value } = ratingData;
  try {
    const ratingsQuery = query(
      collection(db, "ratings"),
      where("storyId", "==", storyId),
      where("userId", "==", userId),
      limit(1)
    );

    const querySnapshot = await getDocs(ratingsQuery);
    const now = Timestamp.now().toMillis().toString();

    if (!querySnapshot.empty) {
      const docId = querySnapshot.docs[0].id;
      await updateDoc(doc(db, "ratings", docId), {
        value,
        updatedAt: now,
      });
    } else {
      await addDoc(collection(db, "ratings"), {
        ...ratingData,
        createdAt: now,
        updatedAt: now,
      });
    }
  } catch (error) {
    console.error("Error setting rating: ", error);
    throw new Error("Failed to set rating");
  }
}

export async function getRating(
  storyId: string,
  userId: string
): Promise<Rating | null> {
  try {
    const ratingsQuery = query(
      collection(db, "ratings"),
      where("storyId", "==", storyId),
      where("userId", "==", userId),
      limit(1)
    );

    const querySnapshot = await getDocs(ratingsQuery);

    if (!querySnapshot.empty) {
      const docSnap = querySnapshot.docs[0];
      const data = docSnap.data() as DocumentData;
      return {
        id: docSnap.id,
        storyId: data.storyId,
        userId: data.userId,
        value: data.value,
      } as Rating;
    }
    return null;
  } catch (error) {
    console.error("Error getting rating: ", error);
    return null;
  }
}

export async function getAverageRating(storyId: string): Promise<ImportedRatingStats> {
  try {
    const ratingsQuery = query(
      collection(db, "ratings"),
      where("storyId", "==", storyId)
    );

    const querySnapshot = await getDocs(ratingsQuery);
    const count = querySnapshot.size;

    if (count === 0) {
      return { average: 0, count: 0 };
    }

    let totalValue = 0;
    querySnapshot.forEach((doc) => {
      const ratingValue = doc.data().value;
      if (typeof ratingValue === 'number') {
        totalValue += ratingValue;
      } else {
        console.warn(`[firestore.ts] Invalid rating value found for story ${storyId}, comment doc ID ${doc.id}:`, ratingValue);
      }
    });
    
    const average = totalValue / count;
    console.log(`[firestore.ts] Calculated average rating for story ${storyId}: ${average}, count: ${count}`);
    return { average, count };
  } catch (error) {
    console.error(`[firestore.ts] Error getting average rating stats for story ${storyId}:`, error);
    return { average: 0, count: 0 };
  }
}

export async function getCommentCountForStory(storyId: string): Promise<number> {
  try {
    const commentsQuery = query(
      collection(db, "comments"),
      where("storyId", "==", storyId)
    );
    const querySnapshot = await getDocs(commentsQuery);
    return querySnapshot.size;
  } catch (error) {
    console.error(`[firestore.ts] Error getting comment count for story ${storyId}:`, error);
    return 0;
  }
}

export async function getUserStories(userId: string): Promise<UserStory[]> {
  try {
    const storiesRef = collection(db, 'stories');
    const q = query(storiesRef, where('authorId', '==', userId));
    const snapshot = await getDocs(q);
    
    const userStories: UserStory[] = [];
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data() as DocumentData;
      console.log(`[firestore.ts] Story ID: ${docSnap.id}, coverImage: ${data.coverImage}`); // Add log
      const commentCount = await getCommentCountForStory(docSnap.id);
      const { average: averageRating } = await getAverageRating(docSnap.id);

      userStories.push({
        id: docSnap.id,
        title: data.title,
        imageUrl: data.coverImage || "/assets/cover.png", // Use story's cover image or default
        commentCount: commentCount,
        averageRating: averageRating,
      });
    }
    return userStories;
  } catch (error) {
    console.error("[firestore.ts] Error getting user stories:", error);
    return [];
  }
}

export async function createComment(
  commentData: CommentInput
): Promise<string> {
  console.log("[firestore.ts] Raw input commentData:", JSON.stringify(commentData, null, 2));

  const dataToSave: Partial<CommentInput> & { userAvatar?: string | null } = { ...commentData };

  if (dataToSave.userAvatar === undefined) {
    console.log("[firestore.ts] Safeguard: userAvatar was undefined, converting to null.");
    dataToSave.userAvatar = null;
  }

  const now = Timestamp.now().toMillis().toString();
  const docDataWithTimestamp = {
    ...dataToSave,
    createdAt: now,
    updatedAt: now,
  };

  console.log("[firestore.ts] Document to be added to 'comments' (after safeguard and adding updatedAt):", JSON.stringify(docDataWithTimestamp, null, 2));
  try {
    const docRef = await addDoc(collection(db, "comments"), docDataWithTimestamp);
    console.log("[firestore.ts] Comment added successfully with ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("[firestore.ts] Error adding comment to Firestore:", error);
    if (error instanceof Error) {
      console.error("[firestore.ts] Error name:", error.name);
      console.error("[firestore.ts] Error message:", error.message);
      if (error.stack) {
        console.error("[firestore.ts] Error stack:", error.stack);
      }
    }
    const originalErrorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to create comment. Firestore error: ${originalErrorMessage}`);
  }
}

export async function getComments(storyId: string): Promise<Comment[]> {
  try {
    const commentsQuery = query(
      collection(db, "comments"),
      where("storyId", "==", storyId),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(commentsQuery);
    const comments: Comment[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data() as DocumentData;
      comments.push({
        id: doc.id,
        storyId: data.storyId,
        userId: data.userId,
        userName: data.userName,
        userAvatar: data.userAvatar,
        text: data.text,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      } as Comment);
    });

    return comments;
  } catch (error) {
    console.error("Error getting comments: ", error);
    return [];
  }
}

export async function getStories(limitCount = 50): Promise<Story[]> {
  try {
    const storiesQuery = query(
      collection(db, "stories"),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(storiesQuery);
    const stories: Story[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data() as DocumentData;
      let chapters = data.chapters || [];
      if (!data.chapters && data.content) {
        chapters = [{ id: 'default', title: 'Chapter 1', content: data.content, order: 1 }];
      }
      
      let genres: string[] = [];
      if (data.genres && Array.isArray(data.genres)) {
        genres = data.genres;
      } else if (data.genre && typeof data.genre === 'string') {
        genres = [data.genre];
      }

      const tags: string[] = (data.tags && Array.isArray(data.tags)) ? data.tags : [];

      stories.push({
        id: doc.id,
        title: data.title,
        chapters: chapters,
        description: data.description,
        genres: genres,
        tags: tags,
        authorId: data.authorId,
        authorName: data.authorName,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt || data.createdAt,
        status: data.status || "published",
        coverImage: data.coverImage || "/placeholder.jpg", // Changed default path
      });
    });

    return stories;
  } catch (error) {
    console.error("Error getting stories: ", error);
    return [];
  }
}

export async function getStory(id: string): Promise<Story | null> {
  try {
    const docRef = doc(db, "stories", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as DocumentData;
      let chapters = data.chapters || [];
      if (data.chapters === undefined && data.content !== undefined) {
        chapters = [{ id: 'default', title: 'Chapter 1', content: data.content, order: 1 }];
      } else if (data.chapters === undefined && data.content === undefined) {
        chapters = [];
      }
      
      let genres: string[] = [];
      if (data.genres && Array.isArray(data.genres)) {
        genres = data.genres;
      } else if (data.genre && typeof data.genre === 'string') {
        genres = [data.genre];
      }

      const tags: string[] = (data.tags && Array.isArray(data.tags)) ? data.tags : [];

      const story: Story = {
        id: docSnap.id,
        title: data.title,
        chapters: chapters,
        genres: genres,
        tags: tags,
        authorId: data.authorId,
        authorName: data.authorName,
        createdAt: data.createdAt,
        description: data.description,
        status: data.status || "published",
        updatedAt: data.updatedAt || data.createdAt,
        coverImage: data.coverImage || "/placeholder.jpg", // Changed default path
      };
      return story;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting story: ", error);
    return null;
  }
}

export async function updateStory(
  id: string,
  updateData: StoryUpdate 
): Promise<void> {
  try {
    const docRef = doc(db, "stories", id);
    const dataToUpdate: Partial<StoryUpdate> = { ...updateData };

    await updateDoc(docRef, dataToUpdate as DocumentData);
  } catch (error) {
    console.error("Error updating story: ", error);
    throw new Error("Failed to update story");
  }
}

export async function deleteStory(id: string): Promise<void> {
  try {
    const docRef = doc(db, "stories", id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting story: ", error);
    throw new Error("Failed to delete story");
  }
}

export async function createUserProfile(
  userId: string,
  profileData: UserProfile
): Promise<void> {
  try {
    const userRef = doc(db, "users", userId);
    const dataWithDefaults = {
      ...profileData,
      favorites: profileData.favorites || [], // Initialize favorites as empty array if not provided
      readLater: profileData.readLater || [], // Initialize readLater as empty array if not provided
    };
    await setDoc(userRef, dataWithDefaults);
  } catch (error) {
    console.error("Error creating user profile: ", error);
    throw new Error("Failed to create user profile");
  }
}

export async function getUserProfile(
  userId: string
): Promise<UserProfile | null> {
  try {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as DocumentData;
      return {
        id: docSnap.id,
        bio: data.bio || "",
        website: data.website || "",
        socialLinks: data.socialLinks || {},
        avatar: data.avatar || "",
        displayName: data.displayName,
        email: data.email,
        favorites: data.favorites || [], // Ensure favorites is always an array
        readLater: data.readLater || [], // Ensure readLater is always an array
      };
    }
    return null;
  } catch (error) {
    console.error("Error getting user profile: ", error);
    return null;
  }
}

export async function updateUserProfile(
  userId: string,
  updateData: Partial<UserProfile>
): Promise<void> {
  try {
    const docRef = doc(db, "users", userId);
    await updateDoc(docRef, updateData as DocumentData);
  } catch (error) {
    console.error("Error updating user profile: ", error);
    throw new Error("Failed to update user profile");
  }
}

export async function toggleFavorite(userId: string, storyId: string): Promise<void> {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      throw new Error("User profile not found");
    }
    
    const userData = userSnap.data();
    const currentFavorites = userData.favorites || [];
    
    let updatedFavorites: string[];
    if (currentFavorites.includes(storyId)) {
      // Remove from favorites
      updatedFavorites = currentFavorites.filter((id: string) => id !== storyId);
    } else {
      // Add to favorites
      updatedFavorites = [...currentFavorites, storyId];
    }
    
    await updateDoc(userRef, { favorites: updatedFavorites });
  } catch (error) {
    console.error("Error toggling favorite: ", error);
    throw new Error("Failed to toggle favorite");
  }
}

export async function getFavoriteStories(userId: string): Promise<Story[]> {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      return [];
    }
    
    const userData = userSnap.data();
    const favoriteIds = userData.favorites || [];
    
    if (favoriteIds.length === 0) {
      return [];
    }
    
    // Fetch all favorite stories
    const favoriteStories: Story[] = [];
    for (const storyId of favoriteIds) {
      const story = await getStory(storyId);
      if (story) {
        favoriteStories.push(story);
      }
    }
    
    return favoriteStories;
  } catch (error) {
    console.error("Error getting favorite stories: ", error);
    return [];
  }
}

export async function isStoryFavorited(userId: string, storyId: string): Promise<boolean> {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      return false;
    }
    
    const userData = userSnap.data();
    const favorites = userData.favorites || [];
    
    return favorites.includes(storyId);
  } catch (error) {
    console.error("Error checking if story is favorited: ", error);
    return false;
  }
}

export async function toggleReadLater(userId: string, storyId: string): Promise<void> {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      throw new Error("User profile not found");
    }
    
    const userData = userSnap.data();
    const currentReadLater = userData.readLater || [];
    
    let updatedReadLater: string[];
    if (currentReadLater.includes(storyId)) {
      // Remove from read later
      updatedReadLater = currentReadLater.filter((id: string) => id !== storyId);
    } else {
      // Add to read later
      updatedReadLater = [...currentReadLater, storyId];
    }
    
    await updateDoc(userRef, { readLater: updatedReadLater });
  } catch (error) {
    console.error("Error toggling read later: ", error);
    throw new Error("Failed to toggle read later");
  }
}

export async function getReadLaterStories(userId: string): Promise<Story[]> {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      return [];
    }
    
    const userData = userSnap.data();
    const readLaterIds = userData.readLater || [];
    
    if (readLaterIds.length === 0) {
      return [];
    }
    
    // Fetch all read later stories
    const readLaterStories: Story[] = [];
    for (const storyId of readLaterIds) {
      const story = await getStory(storyId);
      if (story) {
        readLaterStories.push(story);
      }
    }
    
    return readLaterStories;
  } catch (error) {
    console.error("Error getting read later stories: ", error);
    return [];
  }
}

export async function isStoryInReadLater(userId: string, storyId: string): Promise<boolean> {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      return false;
    }
    
    const userData = userSnap.data();
    const readLater = userData.readLater || [];
    
    return readLater.includes(storyId);
  } catch (error) {
    console.error("Error checking if story is in read later: ", error);
    return false;
  }
}
