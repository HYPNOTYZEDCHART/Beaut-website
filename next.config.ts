import type { NextConfig } from 'next';
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants';

export default function nextConfig(phase: string): NextConfig {
  return {
    reactStrictMode: true,
    devIndicators: false,
    // Isole le cache du serveur de développement (.next-dev) du build de production (.next)
    // pour empêcher définitivement toute corruption "Cannot find module './XXX.js'"
    // lorsqu'un build est exécuté pendant que `npm run dev` tourne.
    distDir: phase === PHASE_DEVELOPMENT_SERVER ? '.next-dev' : '.next',
    compress: true,
    images: {
      formats: ['image/avif', 'image/webp'],
      minimumCacheTTL: 86400,
    },
    async headers() {
      return [
        {
          source: '/images/(.*)',
          headers: [
            {
              key: 'Cache-Control',
              value:
                phase === PHASE_DEVELOPMENT_SERVER
                  ? 'no-store, no-cache, must-revalidate, proxy-revalidate'
                  : 'public, max-age=31536000, immutable',
            },
          ],
        },
        {
          source: '/guides/(.*)',
          headers: [
            {
              key: 'Cache-Control',
              value: 'public, max-age=86400, stale-while-revalidate=604800',
            },
          ],
        },
        {
          source: '/(.*)',
          headers: [
            {
              key: 'X-Content-Type-Options',
              value: 'nosniff',
            },
            {
              key: 'X-Frame-Options',
              value: 'SAMEORIGIN',
            },
            {
              key: 'Referrer-Policy',
              value: 'strict-origin-when-cross-origin',
            },
            {
              key: 'Permissions-Policy',
              value: 'camera=(), microphone=(), geolocation=()',
            },
          ],
        },
      ];
    },
  };
}
