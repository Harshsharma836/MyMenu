import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/server/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const accessLink = await prisma.restaurantAccessLink.findUnique({
      where: { shareToken: id },
      include: {
        restaurant: {
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
          },
        },
      },
    });

    if (!accessLink) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(accessLink.restaurant);
  } catch (error) {
    console.error('Get public menu error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu' },
      { status: 500 }
    );
  }
}
