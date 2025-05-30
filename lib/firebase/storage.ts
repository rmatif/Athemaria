import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { app } from './config';

export const storage = getStorage(app);

// Default placeholder cover image URL (will be set after uploading to Firebase)
export const DEFAULT_COVER_URL = 'https://firebasestorage.googleapis.com/v0/b/your-project-id/o/placeholders%2Fcover.png?alt=media';

/**
 * Upload a file to Firebase Storage
 * @param file - The file to upload
 * @param path - The storage path (e.g., 'covers/story-123.jpg')
 * @returns Promise<string> - The download URL
 */
export async function uploadFile(file: File, path: string): Promise<string> {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('Failed to upload file');
  }
}

/**
 * Upload the default cover placeholder to Firebase Storage
 * This should be run once to set up the default cover
 * @param file - The cover.png file
 * @returns Promise<string> - The download URL
 */
export async function uploadDefaultCover(file: File): Promise<string> {
  try {
    const storageRef = ref(storage, 'placeholders/cover.png');
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('Default cover uploaded successfully:', downloadURL);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading default cover:', error);
    throw new Error('Failed to upload default cover');
  }
}

/**
 * Get the default cover URL from Firebase Storage
 * @returns Promise<string> - The download URL
 */
export async function getDefaultCoverUrl(): Promise<string> {
  try {
    const storageRef = ref(storage, 'placeholders/cover.png');
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error getting default cover URL:', error);
    // Return a fallback URL or throw error
    throw new Error('Failed to get default cover URL');
  }
}

/**
 * Delete a file from Firebase Storage
 * @param path - The storage path of the file to delete
 */
export async function deleteFile(path: string): Promise<void> {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new Error('Failed to delete file');
  }
}

/**
 * Upload a story cover image
 * @param file - The image file
 * @param storyId - The story ID
 * @returns Promise<string> - The download URL
 */
export async function uploadStoryCover(file: File, storyId: string): Promise<string> {
  const path = `covers/${storyId}-${Date.now()}.${file.name.split('.').pop()}`;
  return uploadFile(file, path);
}