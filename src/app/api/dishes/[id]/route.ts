import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/server/db';
import { getUserFromToken } from '@/server/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const user = await getUserFromToken(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { name, description, price, image, spiceLevel, categoryIds } = await request.json();

    const dish = await prisma.dish.findUnique({
      where: { id },
      include: {
        categories: {
          include: {
            category: {
              include: {
                menu: {
                  include: { restaurant: true },
                },
              },
            },
          },
        },
      },
    });

    if (!dish || dish.categories.length === 0) {
      return NextResponse.json(
        { error: 'Dish not found' },
        { status: 404 }
      );
    }

    if (dish.categories[0].category.menu.restaurant.userId !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      );
    }

    const updated = await prisma.dish.update({
      where: { id },
      data: {
        name: name || dish.name,
        description: description !== undefined ? description : dish.description,
        price: price || dish.price,
        image: image || dish.image,
        spiceLevel: spiceLevel !== undefined ? spiceLevel : dish.spiceLevel,
      },
      include: {
        categories: {
          include: { category: true },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Update dish error:', error);
    return NextResponse.json(
      { error: 'Failed to update dish' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const user = await getUserFromToken(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const dish = await prisma.dish.findUnique({
      where: { id },
      include: {
        categories: {
          include: {
            category: {
              include: {
                menu: {
                  include: { restaurant: true },
                },
              },
            },
          },
        },
      },
    });

    if (!dish || dish.categories.length === 0) {
      return NextResponse.json(
        { error: 'Dish not found' },
        { status: 404 }
      );
    }

    if (dish.categories[0].category.menu.restaurant.userId !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      );
    }

    await prisma.dish.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Dish deleted' });
  } catch (error) {
    console.error('Delete dish error:', error);
    return NextResponse.json(
      { error: 'Failed to delete dish' },
      { status: 500 }
    );
  }
}
