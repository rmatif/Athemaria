'use client';

import { useState } from 'react';
import { uploadDefaultCover } from '@/lib/firebase/storage';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Upload, AlertCircle } from 'lucide-react';

export default function UploadCoverPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    url?: string;
    error?: string;
  } | null>(null);

  const handleUploadFromAssets = async () => {
    setIsUploading(true);
    setUploadResult(null);

    try {
      // Fetch the cover.png from the public folder
      const response = await fetch('/cover.png');
      if (!response.ok) {
        throw new Error('Could not fetch cover.png from public folder');
      }

      const blob = await response.blob();
      const file = new File([blob], 'cover.png', { type: 'image/png' });

      const downloadURL = await uploadDefaultCover(file);
      
      setUploadResult({
        success: true,
        url: downloadURL
      });
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadResult(null);

    try {
      const downloadURL = await uploadDefaultCover(file);
      
      setUploadResult({
        success: true,
        url: downloadURL
      });
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          Upload Default Cover to Firebase
        </h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Option 1: Upload from Public Folder
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              This will upload the existing cover.png from your public folder to Firebase Storage.
            </p>
            <Button 
              onClick={handleUploadFromAssets}
              disabled={isUploading}
              className="w-full"
            >
              {isUploading ? (
                <>
                  <Upload className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload from Public Folder
                </>
              )}
            </Button>
          </div>

          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Option 2: Upload Custom File
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Choose a different image file to use as the default cover.
            </p>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md"
            />
          </div>

          {uploadResult && (
            <Alert className={uploadResult.success ? "border-green-500 bg-green-50 dark:bg-green-900/20" : "border-red-500 bg-red-50 dark:bg-red-900/20"}>
              {uploadResult.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription>
                {uploadResult.success ? (
                  <div>
                    <p className="font-semibold text-green-800 dark:text-green-200">
                      Upload successful!
                    </p>
                    <p className="text-green-700 dark:text-green-300 mt-2">
                      URL: <code className="bg-green-100 dark:bg-green-800 px-1 rounded text-sm">{uploadResult.url}</code>
                    </p>
                    <p className="text-green-700 dark:text-green-300 mt-2">
                      Now update the DEFAULT_COVER_URL in lib/firebase/storage.ts with this URL.
                    </p>
                  </div>
                ) : (
                  <p className="text-red-800 dark:text-red-200">
                    Upload failed: {uploadResult.error}
                  </p>
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}