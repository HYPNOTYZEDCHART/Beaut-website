import type { NextConfig } from 'next';
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants';

export default function nextConfig(phase: string): NextConfig {
  return {
    reactStrictMode: true,
    // Isole le cache du serveur de développement (.next-dev) du build de production (.next)
    // pour empêcher définitivement toute corruption "Cannot find module './XXX.js'"
    // lorsqu'un build est exécuté pendant que `npm run dev` tourne.
    distDir: phase === PHASE_DEVELOPMENT_SERVER ? '.next-dev' : '.next',
  };
}
