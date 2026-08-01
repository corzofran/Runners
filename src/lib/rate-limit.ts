/**
 * Rate limiter en memoria — suficiente para una sola instancia (p. ej. Railway con 1 réplica).
 *
 * Si el proyecto escala a múltiples instancias, sustituir por un backend compartido
 * (Upstash Redis + @upstash/ratelimit) para que el conteo sea consistente entre instancias.
 */

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (bucket.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  bucket.count += 1;
  return { allowed: true, remaining: limit - bucket.count };
}
