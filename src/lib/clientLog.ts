"use client";

export async function logClientEvent(event: string, details?: Record<string, unknown>) {
  try {
    await fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, details }),
      keepalive: true,
    });
  } catch {
    // no-op
  }
}
