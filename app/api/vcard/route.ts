// app/api/vcard/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 400 });
  }

  try {
    const profileDoc = await getDoc(doc(db, 'profiles', userId));
    
    if (!profileDoc.exists()) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const profile = profileDoc.data();

    // Build vCard with proper line breaks and formatting
    const vCardLines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${profile.fullName || ''}`,
    ];

    // Add optional fields only if they exist
    if (profile.designation) {
      vCardLines.push(`TITLE:${profile.designation}`);
    }

    if (profile.company) {
      vCardLines.push(`ORG:${profile.company}`);
    }

    if (profile.phone) {
      // Clean phone number (remove spaces and special chars except +)
      const cleanPhone = profile.phone.replace(/[^\d+]/g, '');
      vCardLines.push(`TEL;TYPE=CELL:${cleanPhone}`);
    }

    if (profile.email) {
      vCardLines.push(`EMAIL:${profile.email}`);
    }

    if (profile.website) {
      vCardLines.push(`URL:${profile.website}`);
    }

    if (profile.bio) {
      // Escape special characters in bio
      const cleanBio = profile.bio.replace(/\n/g, '\\n').replace(/,/g, '\\,');
      vCardLines.push(`NOTE:${cleanBio}`);
    }

    // Add social profiles as URLs (more compatible)
    if (profile.linkedin) {
      vCardLines.push(`URL;TYPE=LinkedIn:${profile.linkedin}`);
    }

    if (profile.twitter) {
      vCardLines.push(`URL;TYPE=Twitter:${profile.twitter}`);
    }

    if (profile.instagram) {
      vCardLines.push(`URL;TYPE=Instagram:${profile.instagram}`);
    }

    if (profile.facebook) {
      vCardLines.push(`URL;TYPE=Facebook:${profile.facebook}`);
    }

    // Add profile image if available
    if (profile.profileImage) {
      vCardLines.push(`PHOTO;VALUE=URL;TYPE=JPEG:${profile.profileImage}`);
    }

    vCardLines.push('END:VCARD');

    // Join with \r\n (CRLF) as per vCard spec
    const vCard = vCardLines.join('\r\n');

    // Return vCard file with proper headers
    return new NextResponse(vCard, {
      headers: {
        'Content-Type': 'text/vcard; charset=utf-8',
        'Content-Disposition': `attachment; filename="${profile.slug || 'contact'}.vcf"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Error generating vCard:', error);
    return NextResponse.json({ error: 'Failed to generate vCard' }, { status: 500 });
  }
}