import { appendFile, mkdir } from 'fs/promises';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

type LogPayload = {
  event?: string;
  details?: Record<string, unknown>;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as LogPayload;
    const date = new Date();
    const day = date.toISOString().slice(0, 10);
    const logsDir = path.join(process.cwd(), 'logs');
    const logPath = path.join(logsDir, `${day}.log`);

    await mkdir(logsDir, { recursive: true });

    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ip = forwardedFor?.split(',')[0]?.trim() || realIp || 'unknown';

    const line = JSON.stringify({
      at: date.toISOString(),
      event: body.event ?? 'unknown',
      details: body.details ?? {},
      ip,
      userAgent: request.headers.get('user-agent') ?? 'unknown',
    });

    await appendFile(logPath, `${line}\n`, 'utf8');

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
