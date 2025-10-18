export type UserRole = 'producer' | 'intermediary' | 'retailer' | 'consumer'

export interface UserProfile {
    address: string
    role: UserRole
    name: string
    phone: string
    location: string
    verified: boolean
    createdAt?: string
    updatedAt?: string
}

export interface UserRegistrationPayload {
    address: string
    role: UserRole
    name: string
    phone: string
    location: string
    verified?: boolean
}
