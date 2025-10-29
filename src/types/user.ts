export type UserRole = 'producer' | 'intermediary' | 'retailer' | 'consumer'

export interface UserProfile {
    address: string
    role: UserRole
    name: string
    phone: string
    location?: string
    // optional provider that created/owns this profile (e.g. 'metamask', 'phone')
    provider?: string
    verified: boolean
    createdAt?: string
    updatedAt?: string
}

export interface UserRegistrationPayload {
    address: string
    role: UserRole
    name: string
    phone: string
    location?: string
    // optional: indicate how the user registered (e.g. 'metamask', 'phone')
    provider?: string
    verified?: boolean
}
