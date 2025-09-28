import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/dev/create-admin - Create admin user (DEVELOPMENT ONLY)
export async function POST(request) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'این API فقط در حالت توسعه در دسترس است' },
      { status: 403 }
    );
  }

  try {
    const { phone } = await request.json();

    if (!phone) {
      return NextResponse.json(
        { error: 'شماره تلفن الزامی است' },
        { status: 400 }
      );
    }

    // Find user by phone
    const user = await prisma.user.findUnique({
      where: { phone }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'کاربر با این شماره تلفن یافت نشد' },
        { status: 404 }
      );
    }

    // Make user admin
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { isAdmin: true }
    });

    return NextResponse.json({
      success: true,
      message: 'کاربر با موفقیت ادمین شد',
      user: {
        id: updatedUser.id,
        phone: updatedUser.phone,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        isAdmin: updatedUser.isAdmin
      }
    });

  } catch (error) {
    console.error('Create admin error:', error);
    return NextResponse.json(
      { error: 'خطای سرور' },
      { status: 500 }
    );
  }
}
