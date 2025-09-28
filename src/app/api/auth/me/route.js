import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function GET(request) {
  try {
    const user = await verifyToken(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'احراز هویت نشده' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        isAdmin: user.isAdmin
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'خطای سرور' },
      { status: 500 }
    );
  }
}
