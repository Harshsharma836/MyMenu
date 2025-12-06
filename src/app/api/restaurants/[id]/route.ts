import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/server/db';
import { getUserFromToken } from '@/server/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
      include: {
        menus: {
          include: {
            categories: {
              include: {
                dishes: {
                  include: {
                    dish: true,
                  },
                },
              },
            },
          },
        },
        accessLinks: true,
      },
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(restaurant);
  } catch (error) {
    console.error('Get restaurant error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch restaurant' },
      { status: 500 }
    );
  }
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

    const { name, location } = await request.json();

    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
    });

    if (!restaurant || restaurant.userId !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      );
    }

    const updated = await prisma.restaurant.update({
      where: { id },
      data: {
        name: name || restaurant.name,
        location: location || restaurant.location,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Update restaurant error:', error);
    return NextResponse.json(
      { error: 'Failed to update restaurant' },
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

    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
    });

    if (!restaurant || restaurant.userId !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      );
    }

    await prisma.restaurant.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Restaurant deleted' });
  } catch (error) {
    console.error('Delete restaurant error:', error);
    return NextResponse.json(
      { error: 'Failed to delete restaurant' },
      { status: 500 }
    );
  }
}
