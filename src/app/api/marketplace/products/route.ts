import { NextResponse } from 'next/server';
import { getFirestore } from '../../../../lib/firebaseAdmin';
import type { Product } from '@/types/product';

const COLLECTION = 'marketplace_products';

export async function GET() {
  try {
    const db = getFirestore();
    const snap = await db.collection(COLLECTION).orderBy('createdAt', 'desc').get();
    const products: Product[] = snap.docs.map((doc) => {
      const data = doc.data() as Omit<Product, 'id'>;
      return { id: doc.id, ...data } as Product;
    });
    return NextResponse.json(products);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('GET /api/marketplace/products error:', message, error);
    return NextResponse.json({ error: message }, { status: 500 });
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
    const nowIso = new Date().toISOString();
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
      createdAt: nowIso,
      updatedAt: nowIso,
      images: body.images ?? [],
      batchId: body.batchId ?? undefined,
      metadataHash: body.metadataHash ?? undefined,
      metadataPath: body.metadataPath ?? undefined,
      workflowActor: body.workflowActor ?? undefined
    };

    const ref = await db.collection(COLLECTION).add(newDoc);
    const savedSnapshot = await ref.get();
    const savedData = savedSnapshot.data() as Omit<Product, 'id'> | undefined;
    if (!savedData) {
      throw new Error('Saved product data not found');
    }

    console.log('DEBUG saved product id:', ref.id);
    const product: Product = { id: ref.id, ...savedData };
    return NextResponse.json(product, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('POST /api/marketplace/products error:', message, error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
