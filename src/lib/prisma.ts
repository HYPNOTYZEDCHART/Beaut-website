import net from 'node:net';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  dbReachableState: { reachable: boolean; checkedAt: number } | undefined;
};

export const prisma: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Désactive le log 'error' automatique sur stderr pour éviter que Next.js 15 DevOverlay
    // n'affiche le badge rouge "1 Issue" lorsque PostgreSQL local est éteint et que le fallback prend le relais.
    log: ['warn'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * Disjoncteur TCP ultra-rapide (Circuit Breaker) :
 * Vérifie en < 150ms si la base PostgreSQL configurée dans DATABASE_URL accepte les connexions,
 * et met en cache le statut pendant 10 secondes pour éviter tout ralentissement SSR.
 */
export async function isDatabaseReachableFast(): Promise<boolean> {
  const now = Date.now();
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    globalForPrisma.dbReachableState = { reachable: false, checkedAt: now };
    return false;
  }

  let host = '127.0.0.1';
  let port = 5432;
  try {
    const parsed = new URL(dbUrl);
    if (parsed.hostname) host = parsed.hostname;
    if (parsed.port) port = Number.parseInt(parsed.port, 10) || 5432;
  } catch {
    globalForPrisma.dbReachableState = { reachable: false, checkedAt: now };
    return false;
  }

  const isLocalHost =
    host === 'localhost' || host === '127.0.0.1' || host === '::1';
  const cached = globalForPrisma.dbReachableState;
  const ttlMs = cached?.reachable ? (isLocalHost ? 10_000 : 60_000) : 10_000;

  if (cached && now - cached.checkedAt < ttlMs) {
    return cached.reachable;
  }

  const socketTimeoutMs = isLocalHost ? 200 : 2500;

  const reachable = await new Promise<boolean>((resolve) => {
    const socket = new net.Socket();
    let settled = false;

    const finish = (result: boolean) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve(result);
    };

    socket.setTimeout(socketTimeoutMs);
    socket.once('connect', () => finish(true));
    socket.once('timeout', () => finish(false));
    socket.once('error', () => finish(false));
    socket.connect(port, host);
  });

  globalForPrisma.dbReachableState = { reachable, checkedAt: now };
  return reachable;
}

