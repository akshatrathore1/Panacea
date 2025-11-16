import { NextResponse } from 'next/server';
import { getFirestore } from '../../../../../lib/firebaseAdmin';
import type { Product } from '@/types/product';

const COLLECTION = 'marketplace_products';

export async function PATCH(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    const params = await context.params;
    const id = params?.id;

    if (!id) {
        return NextResponse.json({ error: 'Missing product id' }, { status: 400 });
    }

    try {
        const payload = (await req.json()) as Partial<Product> & Record<string, unknown>;
        const typedPayload: Partial<Product> = payload;
        const updates: Partial<Product> = {};
        const hasField = (field: keyof Product) => Object.prototype.hasOwnProperty.call(payload, field);

        if (hasField('name') && typeof typedPayload.name === 'string') {
            updates.name = typedPayload.name;
        }

        if (hasField('unit') && typeof typedPayload.unit === 'string') {
            updates.unit = typedPayload.unit;
        }

        if (hasField('description') && typeof typedPayload.description === 'string') {
            updates.description = typedPayload.description;
        }

        if (hasField('category') && typeof typedPayload.category === 'string') {
            updates.category = typedPayload.category;
        }

        if (hasField('status') && typeof typedPayload.status === 'string') {
            updates.status = typedPayload.status as Product['status'];
        }

        if (hasField('harvestDate')) {
            const value = typedPayload.harvestDate;
            if (typeof value === 'string' || value === null) {
                updates.harvestDate = value;
            }
        }

        if (hasField('quantity')) {
            const parsed = Number(payload.quantity);
            if (!Number.isNaN(parsed)) {
                updates.quantity = parsed;
            }
        }

        if (hasField('price')) {
            const parsed = Number(payload.price);
            if (!Number.isNaN(parsed)) {
                updates.price = parsed;
            }
        }

        if (hasField('images')) {
            const candidate = typedPayload.images;
            updates.images = Array.isArray(candidate)
                ? candidate.filter((value): value is string => typeof value === 'string')
                : [];
        }

        if (updates.status && !['active', 'sold', 'cancelled'].includes(updates.status)) {
            return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
        }

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
        }

        updates.updatedAt = new Date().toISOString();

        const db = getFirestore();
        const ref = db.collection(COLLECTION).doc(id);
        const snapshot = await ref.get();

        if (!snapshot.exists) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        await ref.set(updates, { merge: true });
        const updated = await ref.get();
        const data = updated.data();

        return NextResponse.json({ id, ...(data as Product | undefined) });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error(`PATCH /api/marketplace/products/${id ?? 'unknown'} error:`, message, error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function DELETE(
    _req: Request,
    context: { params: Promise<{ id: string }> }
) {
    const params = await context.params;
    const id = params?.id;

    if (!id) {
        return NextResponse.json({ error: 'Missing product id' }, { status: 400 });
    }

    try {
        const db = getFirestore();
        const ref = db.collection(COLLECTION).doc(id);
        const snapshot = await ref.get();

        if (!snapshot.exists) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        await ref.delete();

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error(`DELETE /api/marketplace/products/${id ?? 'unknown'} error:`, message, error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
