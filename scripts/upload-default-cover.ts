/**
 * Script to upload the default cover image to Firebase Storage
 * Run this once to set up the default cover in Firebase
 * 
 * Usage: npx ts-node scripts/upload-default-cover.ts
 */

import { uploadDefaultCover } from '../lib/firebase/storage';
import * as fs from 'fs';
import * as path from 'path';

async function uploadCover() {
  try {
    // Check if cover.png exists in assets or public folder
    const assetsCoverPath = path.join(process.cwd(), 'assets', 'cover.png');
    const publicCoverPath = path.join(process.cwd(), 'public', 'cover.png');
    
    let coverPath: string;
    
    if (fs.existsSync(assetsCoverPath)) {
      coverPath = assetsCoverPath;
      console.log('Found cover.png in assets folder');
    } else if (fs.existsSync(publicCoverPath)) {
      coverPath = publicCoverPath;
      console.log('Found cover.png in public folder');
    } else {
      throw new Error('cover.png not found in assets or public folder');
    }

    // Read the file
    const fileBuffer = fs.readFileSync(coverPath);
    const file = new File([fileBuffer], 'cover.png', { type: 'image/png' });

    console.log('Uploading default cover to Firebase Storage...');
    const downloadURL = await uploadDefaultCover(file);
    
    console.log('✅ Default cover uploaded successfully!');
    console.log('📎 Download URL:', downloadURL);
    console.log('');
    console.log('🔧 Next steps:');
    console.log('1. Update the DEFAULT_COVER_URL in lib/firebase/storage.ts with this URL');
    console.log('2. Update your components to use the new Firebase-hosted cover');
    
  } catch (error) {
    console.error('❌ Error uploading default cover:', error);
    process.exit(1);
  }
}

// Run the upload
uploadCover();