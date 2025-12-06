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

    const { name } = await request.json();

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        menu: {
          include: { restaurant: true },
        },
      },
    });

    if (!category || category.menu.restaurant.userId !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      );
    }

    const updated = await prisma.category.update({
      where: { id },
      data: { name: name || category.name },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Update category error:', error);
    return NextResponse.json(
      { error: 'Failed to update category' },
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

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        menu: {
          include: { restaurant: true },
        },
      },
    });

    if (!category || category.menu.restaurant.userId !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      );
    }

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Category deleted' });
  } catch (error) {
    console.error('Delete category error:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}
