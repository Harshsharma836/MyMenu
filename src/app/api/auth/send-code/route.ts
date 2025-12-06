import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/server/db';
import { sendVerificationEmail, generateVerificationCode } from '@/server/email';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const user = await prisma.user.upsert({
      where: { email },
      update: { verificationCode: code },
      create: {
        email,
        fullName: '',
        country: '',
        verificationCode: code,
      },
    });

    await sendVerificationEmail(email, code);

    return NextResponse.json(
      { message: 'Verification code sent', userId: user.id },
      { status: 200 }
    );
  } catch (error) {
    console.error('Send code error:', error);
    return NextResponse.json(
      { error: 'Failed to send verification code' },
      { status: 500 }
    );
  }
}
