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

export async function getUserFromToken(token?: any) {
  const tokenValue = token || (await getAuthToken());
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
