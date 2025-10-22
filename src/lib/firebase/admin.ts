import { App, cert, getApps,getApp,initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

let app: App | undefined

const createAdminApp = () => {
    if (getApps().length) {
        return getApp();
    }

    const projectId = process.env.FIREBASE_PROJECT_ID
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
    const privateKey = process.env.FIREBASE_PRIVATE_KEY

    if (!projectId || !clientEmail || !privateKey) {
        throw new Error('Firebase admin credentials are not configured')
    }

    return initializeApp({
        credential: cert({
            projectId,
            clientEmail,
            privateKey: privateKey.replace(/\\n/g, '\n')
        })
    })

}

export const getAdminDb = () => getFirestore(createAdminApp())
