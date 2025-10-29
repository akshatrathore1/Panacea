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
    // provider indicates how this user was created (e.g. 'metamask' or 'phone')
    provider: docData.provider,
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
        // Make `location` and `phone` optional on the API side — default to empty string when absent.
        // Require at least role and name so we can create minimal wallet-backed profiles.
        if (!body.role || !body.name) {
            return NextResponse.json({ error: 'role and name are required' }, { status: 400 })
        }

        let inputAddress = body.address
        if (!inputAddress) {
            // Use a phone-derived id to avoid requiring MetaMask for consumers
            inputAddress = `phone:${body.phone || ''}`
        }

        const normalized = normalizeAddress(inputAddress)
        const adminDb = getAdminDb()
        const docRef = adminDb.collection(COLLECTION).doc(normalized)
        const existing = await docRef.get()

        const now = Timestamp.now()

        // Detect whether this looks like an Ethereum address (0x prefixed, 40 hex chars)
        const isEthAddress = /^0x[a-f0-9]{40}$/i.test(normalized)

        const payload: Record<string, unknown> = {
            address: normalized,
            role: body.role,
            name: body.name,
            // default phone to empty string when absent
            phone: body.phone || '',
            // default missing location to empty string for backward compatibility
            location: body.location || '',
            // persist provider if supplied by client or derive from address type
            provider: body.provider || (isEthAddress ? 'metamask' : 'phone'),
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
