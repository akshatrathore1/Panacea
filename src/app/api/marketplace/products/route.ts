import { NextResponse } from 'next/server';
import { getFirestore } from '../../../../lib/firebaseAdmin';
import type { Product } from '@/types/product';

const COLLECTION = 'marketplace_products';

export async function GET() {
  try {
    const db = getFirestore();
    const snap = await db.collection(COLLECTION).orderBy('createdAt', 'desc').get();
    const products: Product[] = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
    return NextResponse.json(products);
  } catch (err: any) {
    console.error('GET /api/marketplace/products error:', err?.message ?? err);
    return NextResponse.json({ error: err?.message ?? 'Internal error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('DEBUG POST /api/marketplace/products received body:', JSON.stringify(body));

    // quick validation log
    const required = ['name', 'quantity', 'price', 'unit', 'category', 'producer'];
    const missing = required.filter(k => body[k] === undefined || body[k] === null || body[k] === '');
    if (missing.length) {
      console.warn('DEBUG missing fields:', missing);
      return NextResponse.json({ error: `Missing fields: ${missing.join(', ')}` }, { status: 400 });
    }

    // ensure firebase initialized
    const db = getFirestore();
    const newDoc: Partial<Product> = {
      name: String(body.name),
      quantity: Number(body.quantity),
      unit: String(body.unit),
      price: Number(body.price),
      description: body.description ?? '',
      category: String(body.category),
      harvestDate: body.harvestDate ?? null,
      producer: body.producer,
      status: 'active',
      createdAt: new Date().toISOString(),
      images: body.images ?? []
    };

    const ref = await db.collection(COLLECTION).add(newDoc);
    const saved = (await ref.get()).data();
    console.log('DEBUG saved product id:', ref.id);
    return NextResponse.json({ id: ref.id, ...(saved as any) }, { status: 201 });
  } catch (err: any) {
    console.error('POST /api/marketplace/products error:', err?.message ?? err, err?.stack);
    return NextResponse.json({ error: err?.message ?? 'Internal error' }, { status: 500 });
  }
}
