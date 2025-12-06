import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const menu = await prisma.menu.findUnique({
      where: { id },
      include: {
        categories: {
          include: {
            dishes: {
              include: { dish: true }
            }
          }
        }
      }
    });
    if (!menu) return NextResponse.json({ error: 'Menu not found' }, { status: 404 });
    return NextResponse.json(menu);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Menu fetch error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
