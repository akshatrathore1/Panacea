import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config) => {
        config.resolve.fallback = {
            fs: false,
            net: false,
            tls: false,
        };
        return config;
    },
    images: {
        domains: ['localhost'],
    },
    outputFileTracingRoot: __dirname,
    // Disable development indicators and overlays
    devIndicators: {
        position: 'bottom-right',
    },
    // Disable development overlay
    onDemandEntries: {
        maxInactiveAge: 25 * 1000,
        pagesBufferLength: 2,
    },
    // Remove or update any redirects that might be sending /sales to /marketplace
    async redirects() {
        return [
            // Make sure there are no redirects from /dashboard/producer/sales to marketplace
        ]
    }
}

export default nextConfig;