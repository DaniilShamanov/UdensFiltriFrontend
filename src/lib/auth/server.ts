import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}

export async function requireAuth(opts: { locale: string; next?: string }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('access')?.value;

  if (!token) {
    const next = encodeURIComponent(opts.next ?? '/');
    redirect(`/${opts.locale}/auth/sign-in?next=${next}`);
  }

  try {
    await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
  } catch {
    const next = encodeURIComponent(opts.next ?? '/');
    redirect(`/${opts.locale}/auth/sign-in?next=${next}`);
  }
}