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
}

export default nextConfig;