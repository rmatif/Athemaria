import { useState, useEffect } from 'react';
import { getDefaultCoverUrl } from '@/lib/firebase/storage';

// Cache the default cover URL to avoid repeated Firebase calls
let cachedDefaultCoverUrl: string | null = null;

export function useDefaultCover() {
  const [defaultCoverUrl, setDefaultCoverUrl] = useState<string>('/placeholder.jpg'); // Fallback
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDefaultCover() {
      // Return cached URL if available
      if (cachedDefaultCoverUrl) {
        setDefaultCoverUrl(cachedDefaultCoverUrl);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const url = await getDefaultCoverUrl();
        cachedDefaultCoverUrl = url; // Cache the URL
        setDefaultCoverUrl(url);
        setError(null);
      } catch (err) {
        console.error('Failed to load default cover from Firebase:', err);
        setError('Failed to load default cover');
        // Keep the fallback URL
      } finally {
        setIsLoading(false);
      }
    }

    fetchDefaultCover();
  }, []);

  return { defaultCoverUrl, isLoading, error };
}

// Utility function to get the default cover URL synchronously (for immediate use)
export function getDefaultCoverUrlSync(): string {
  return cachedDefaultCoverUrl || '/placeholder.jpg';
}

// Function to clear the cache (useful if you update the default cover)
export function clearDefaultCoverCache(): void {
  cachedDefaultCoverUrl = null;
}