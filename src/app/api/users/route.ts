import { NextRequest, NextResponse } from 'next/server'
import { Timestamp, type DocumentData } from 'firebase-admin/firestore'
import {getAdminDb}  from '@/lib/firebase/admin'
import { UserProfile, UserRegistrationPayload } from '@/types/user'

const COLLECTION = 'users'

const normalizeAddress = (address: string) => address.trim().toLowerCase()

const formatTimestamp = (value: unknown) => {
    if (value instanceof Timestamp) {
        return value.toDate().toISOString()
    }

    if (typeof value === 'string') {
        return value
    }

    if (value instanceof Date) {
        return value.toISOString()
    }

    return undefined
}

const serializeUser = (docData: DocumentData, address: string): UserProfile => ({
    address,
    role: docData.role,
    name: docData.name,
    phone: docData.phone,
    location: docData.location,
    verified: Boolean(docData.verified),
    createdAt: formatTimestamp(docData.createdAt),
    updatedAt: formatTimestamp(docData.updatedAt)
})

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const address = searchParams.get('address')

        if (!address) {
            return NextResponse.json({ error: 'address query parameter is required' }, { status: 400 })
        }

        const normalized = normalizeAddress(address)
        const adminDb = getAdminDb()
        const doc = await adminDb.collection(COLLECTION).doc(normalized).get()

        if (!doc.exists) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        return NextResponse.json(serializeUser(doc.data() || {}, normalized))
    } catch (error) {
        console.error('Failed to fetch user profile', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = (await request.json()) as Partial<UserRegistrationPayload>

        // Allow missing address for users who don't have a wallet (e.g., consumers).
        if (!body.role || !body.name || !body.phone || !body.location) {
            return NextResponse.json({ error: 'role, name, phone, and location are required' }, { status: 400 })
        }

        let inputAddress = body.address
        if (!inputAddress) {
            // Use a phone-derived id to avoid requiring MetaMask for consumers
            inputAddress = `phone:${body.phone}`
        }

        const normalized = normalizeAddress(inputAddress)
        const adminDb = getAdminDb()
        const docRef = adminDb.collection(COLLECTION).doc(normalized)
        const existing = await docRef.get()

        const now = Timestamp.now()
        const payload = {
            address: normalized,
            role: body.role,
            name: body.name,
            phone: body.phone,
            location: body.location,
            verified: Boolean(body.verified),
            updatedAt: now,
            createdAt: existing.exists ? existing.data()?.createdAt ?? now : now
        }

        await docRef.set(payload, { merge: true })
        const saved = await docRef.get()
        const savedData = saved.data()

        if (!savedData) {
            return NextResponse.json({ error: 'Failed to persist user' }, { status: 500 })
        }

        const status = existing.exists ? 200 : 201
        return NextResponse.json(serializeUser(savedData, normalized), { status })
    } catch (error) {
        console.error('Failed to create or update user profile', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
