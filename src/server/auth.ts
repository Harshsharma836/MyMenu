import { cookies } from 'next/headers';
import prisma from './db';

const TOKEN_NAME = 'auth_token';
const TOKEN_EXPIRY_HOURS = 24;

export async function setAuthToken(userId: string) {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

  await prisma.session.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: TOKEN_EXPIRY_HOURS * 60 * 60,
    path: '/',
  });

  return token;
}

export async function getAuthToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_NAME)?.value;
  return token;
}

export async function getUserFromToken(tokenOrRequest?: any) {
  // tokenOrRequest can be:
  // - undefined -> read from server cookies() via getAuthToken()
  // - a string token value
  // - a NextRequest/Request object containing cookies or cookie header
  let tokenValue: string | undefined | null = null;

  if (typeof tokenOrRequest === 'string') {
    tokenValue = tokenOrRequest;
  } else if (tokenOrRequest && typeof tokenOrRequest === 'object') {
    // Try to read cookies from NextRequest-like object
    try {
      const maybeCookies = (tokenOrRequest as any).cookies;
      if (maybeCookies && typeof maybeCookies.get === 'function') {
        const c = maybeCookies.get(TOKEN_NAME);
        tokenValue = c?.value;
      } else if (tokenOrRequest.headers && typeof tokenOrRequest.headers.get === 'function') {
        const cookieHeader = tokenOrRequest.headers.get('cookie') || '';
        const match = cookieHeader.split(';').map((s: string) => s.trim()).find((s: string) => s.startsWith(TOKEN_NAME + '='));
        if (match) tokenValue = match.split('=')[1];
      } else {
        // Fall back to treating tokenOrRequest as token-like
        tokenValue = (tokenOrRequest as any).toString?.() || null;
      }
    } catch (e) {
      tokenValue = null;
    }
  } else {
    tokenValue = await getAuthToken();
  }

  // Ensure tokenValue is a string; otherwise fallback to reading server cookies
  if (typeof tokenValue !== 'string') {
    // try server cookie fallback
    tokenValue = await getAuthToken();
  }

  if (!tokenValue) return null;

  const session = await prisma.session.findUnique({
    where: { token: tokenValue },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    return null;
  }

  return session.user;
}

export async function clearAuthToken() {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_NAME);
}

function generateToken(): string {
  return Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
}
