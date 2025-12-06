import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/server/db';
import { getUserFromToken } from '@/server/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken();

    if (!user) {
      console.log('📨 GET /api/restaurants - No user found, returning 401');
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const restaurants = await prisma.restaurant.findMany({
      where: { userId: user.id },
      include: {
        menus: true,
      },
    });

    return NextResponse.json(restaurants);
  } catch (error) {
    console.error('Get restaurants error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch restaurants' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken();

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { name, location } = await request.json();

    if (!name || !location) {
      return NextResponse.json(
        { error: 'Name and location are required' },
        { status: 400 }
      );
    }

    const restaurant = await prisma.restaurant.create({
      data: {
        name,
        location,
        userId: user.id,
      },
    });

    // Create default access link with QR code
    await prisma.restaurantAccessLink.create({
      data: {
        restaurantId: restaurant.id,
        shareToken: generateShareToken(),
      },
    });

    return NextResponse.json(restaurant, { status: 201 });
  } catch (error) {
    console.error('Create restaurant error:', error);
    return NextResponse.json(
      { error: 'Failed to create restaurant' },
      { status: 500 }
    );
  }
}

function generateShareToken(): string {
  return Math.random().toString(36).substring(2, 11);
}
