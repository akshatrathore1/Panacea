import './globals.css'
import type { Metadata, Viewport } from 'next'
import { Providers } from '@/components/Providers'

export const metadata: Metadata = {
    title: 'कृषिआलोक | KrashiAalok - Blockchain Agricultural Supply Chain',
    description: 'Transparent agricultural supply chain tracking from farm to consumer using blockchain technology',
    keywords: 'agriculture, blockchain, supply chain, transparency, farmers, कृषि, ब्लॉकचेन',
    authors: [{ name: 'KrashiAalok Team' }],
}

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <head>
                <meta name="theme-color" content="#f97316" />
                <meta name="next-dev-indicator" content="false" />
                <meta name="dev-tools" content="disabled" />
            </head>
            <body className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50">
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    )
}