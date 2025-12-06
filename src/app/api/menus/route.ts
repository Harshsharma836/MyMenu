import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/server/db';
import { getUserFromToken } from '@/server/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken();

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { name, description, restaurantId } = await request.json();

    if (!name || !restaurantId) {
      return NextResponse.json(
        { error: 'Name and restaurant ID are required' },
        { status: 400 }
      );
    }

    // Verify ownership
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant || restaurant.userId !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      );
    }

    const menu = await prisma.menu.create({
      data: {
        name,
        description,
        restaurantId,
      },
    });

    return NextResponse.json(menu, { status: 201 });
  } catch (error) {
    console.error('Create menu error:', error);
    return NextResponse.json(
      { error: 'Failed to create menu' },
      { status: 500 }
    );
  }
}
