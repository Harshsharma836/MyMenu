import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/server/db';
import { setAuthToken } from '@/server/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, code, fullName, country } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and code are required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.verificationCode !== code) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 401 }
      );
    }

    if (fullName && country) {
      await prisma.user.update({
        where: { email },
        data: {
          fullName,
          country,
          isVerified: true,
          verificationCode: null,
        },
      });
    }

    await setAuthToken(user.id);

    return NextResponse.json(
      { message: 'Logged in successfully', userId: user.id },
      { status: 200 }
    );
  } catch (error) {
    console.error('Verify code error:', error);
    return NextResponse.json(
      { error: 'Failed to verify code' },
      { status: 500 }
    );
  }
}
