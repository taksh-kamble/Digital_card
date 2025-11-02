/* eslint-disable @typescript-eslint/no-explicit-any */
// scripts/createBulkUsers.ts
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import * as fs from 'fs';
import * as path from 'path';
import FormData from 'form-data';

// Manually load .env.local
const envPath = path.join(process.cwd(), '.env.local');
const envFile = fs.readFileSync(envPath, 'utf-8');
const envVars: Record<string, string> = {};

envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=:#]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    let value = match[2].trim();
    // Remove quotes if present
    value = value.replace(/^["']|["']$/g, '');
    envVars[key] = value;
    process.env[key] = value;
  }
});

console.log('✓ Loaded environment variables');

// Initialize Firebase Admin SDK
if (getApps().length === 0) {
  initializeApp({
    credential: cert({
      projectId: envVars.FIREBASE_PROJECT_ID,
      clientEmail: envVars.FIREBASE_CLIENT_EMAIL,
      privateKey: envVars.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}

const auth = getAuth();
const db = getFirestore();

interface ProfileData {
  'full name': string;
  company: string;
  designation: string;
  email: string;
  phone: string | number;
  profileImage: string;
  website: string;
  linkedin: string;
  bio: string;
  twitter?: string;
  instagram?: string;
  facebook?: string;
}

async function uploadImageToCloudinary(localImagePath: string): Promise<string> {
  try {
    const imagePath = path.join(process.cwd(), 'public', localImagePath);
    
    if (!fs.existsSync(imagePath)) {
      console.warn(`   ⚠️ Image not found: ${imagePath}`);
      return '';
    }

    const cloudName = envVars.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = envVars.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    const formData = new FormData();
    formData.append('file', fs.createReadStream(imagePath));
    formData.append('upload_preset', uploadPreset);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData as any,
      }
    );

    const data = await response.json();
    return data.secure_url || '';
  } catch (error) {
    console.error(`   ❌ Error uploading image:`, error);
    return '';
  }
}

async function createUser(profile: ProfileData) {
  const password = '123456';
  
  try {
    console.log(`\n📝 ${profile['full name']}`);
    
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(profile.email);
      console.log(`   ✓ Account exists`);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        userRecord = await auth.createUser({
          email: profile.email,
          password: password,
          displayName: profile['full name'],
        });
        console.log(`   ✓ Created account`);
      } else {
        throw error;
      }
    }

    let imageUrl = '';
    if (profile.profileImage) {
      imageUrl = await uploadImageToCloudinary(profile.profileImage);
      if (imageUrl) {
        console.log(`   ✓ Uploaded image`);
      }
    }

    const profileData = {
      fullName: profile['full name'],
      designation: profile.designation || '',
      company: profile.company || '',
      bio: profile.bio || '',
      profileImage: imageUrl || profile.profileImage,
      phone: String(profile.phone || ''),
      email: profile.email,
      website: profile.website || '',
      linkedin: profile.linkedin || '',
      twitter: profile.twitter || '',
      instagram: profile.instagram || '',
      facebook: profile.facebook || '',
      updatedAt: new Date(),
      createdAt: new Date(),
    };

    await db.collection('profiles').doc(userRecord.uid).set(profileData);
    await db.collection('users').doc(userRecord.uid).set({
      email: profile.email,
      createdAt: new Date(),
    });
    
    console.log(`   ✅ Done`);
    
    return { success: true, email: profile.email };
  } catch (error: any) {
    console.error(`   ❌ Failed: ${error.message}`);
    return { success: false, email: profile.email, error: error.message };
  }
}

async function main() {
  console.log('🚀 Starting bulk user creation...\n');

  const jsonPath = path.join(process.cwd(), 'Team_Profiles_Details.json');
  const jsonData = fs.readFileSync(jsonPath, 'utf-8');
  const profiles: ProfileData[] = JSON.parse(jsonData);

  console.log(`📊 Processing ${profiles.length} profiles\n`);

  const results = [];

  for (const profile of profiles) {
    const result = await createUser(profile);
    results.push(result);
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log('\n' + '='.repeat(40));
  console.log(`✅ Success: ${successful} | ❌ Failed: ${failed}`);
  console.log('='.repeat(40));
  console.log('\n✨ Password for all accounts: 123456\n');
}

main();