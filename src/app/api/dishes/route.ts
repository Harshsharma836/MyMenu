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

    const { name, description, price, image, spiceLevel, categoryIds } = await request.json();

    if (!name || !price || !categoryIds || categoryIds.length === 0) {
      return NextResponse.json(
        { error: 'Name, price, and at least one category are required' },
        { status: 400 }
      );
    }

    // Verify ownership by checking if all categories belong to user's restaurants
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
      include: {
        menu: {
          include: { restaurant: true },
        },
      },
    });

    for (const cat of categories) {
      if (cat.menu.restaurant.userId !== user.id) {
        return NextResponse.json(
          { error: 'Not authorized' },
          { status: 403 }
        );
      }
    }

    const dish = await prisma.dish.create({
      data: {
        name,
        description,
        price,
        image,
        spiceLevel: spiceLevel || 0,
        categories: {
          create: categoryIds.map((categoryId: string) => ({
            categoryId,
          })),
        },
      },
      include: {
        categories: {
          include: { category: true },
        },
      },
    });

    return NextResponse.json(dish, { status: 201 });
  } catch (error) {
    console.error('Create dish error:', error);
    return NextResponse.json(
      { error: 'Failed to create dish' },
      { status: 500 }
    );
  }
}
