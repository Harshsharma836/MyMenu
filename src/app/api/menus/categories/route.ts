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

    const { name, menuId } = await request.json();

    if (!name || !menuId) {
      return NextResponse.json(
        { error: 'Name and menu ID are required' },
        { status: 400 }
      );
    }

    // Verify ownership
    const menu = await prisma.menu.findUnique({
      where: { id: menuId },
      include: { restaurant: true },
    });

    if (!menu || menu.restaurant.userId !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name,
        menuId,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Create category error:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
