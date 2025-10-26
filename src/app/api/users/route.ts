import { NextRequest, NextResponse } from 'next/server';
import { getFirestore } from '../../../lib/firebaseAdmin';
import type { UserProfile, UserRegistrationPayload } from '@/types/user';

const COLLECTION = 'users';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json({ error: 'address query parameter is required' }, { status: 400 });
    }

    const db = getFirestore();
    const snap = await db
      .collection(COLLECTION)
      .where('address', '==', address.toLowerCase())
      .limit(1)
      .get();

    if (snap.empty) {
      return NextResponse.json(null);
    }

    const doc = snap.docs[0];
    return NextResponse.json({ id: doc.id, ...(doc.data() as any) } as UserProfile);
  } catch (error) {
    console.error('GET /api/users error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<UserRegistrationPayload>;

    if (!body.address) {
      return NextResponse.json({ error: 'address required' }, { status: 400 });
    }

    const db = getFirestore();
    const normalizedAddress = String(body.address).toLowerCase();

    // Prevent duplicates: return existing if found
    const existing = await db
      .collection(COLLECTION)
      .where('address', '==', normalizedAddress)
      .limit(1)
      .get();

    if (!existing.empty) {
      const doc = existing.docs[0];
      return NextResponse.json({ id: doc.id, ...(doc.data() as any) } as UserProfile, { status: 200 });
    }

    const payload = {
      ...body,
      address: normalizedAddress,
      verified: !!body.verified,
      createdAt: new Date().toISOString(),
    };

    const ref = await db.collection(COLLECTION).add(payload);
    const saved = (await ref.get()).data();

    return NextResponse.json({ id: ref.id, ...(saved as any) }, { status: 201 });
  } catch (error) {
    console.error('POST /api/users error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
