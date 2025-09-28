import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { prisma } from './prisma';

// Verify JWT token and return user
export async function verifyToken(request) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    return user;
  } catch (error) {
    return null;
  }
}

// Middleware to require authentication
export function requireAuth(handler) {
  return async (request) => {
    try {
      const user = await verifyToken(request);
      
      if (!user) {
        return NextResponse.json(
          { error: 'احراز هویت مورد نیاز است' },
          { status: 401 }
        );
      }

      const result = await handler(request, user);
      return result;
    } catch (error) {
      console.error('RequireAuth error:', error);
      return NextResponse.json(
        { error: 'خطای سرور' },
        { status: 500 }
      );
    }
  };
}

// Middleware to require admin access
export function requireAdmin(handler) {
  return async (request) => {
    try {
      const user = await verifyToken(request);
      
      if (!user) {
        return NextResponse.json(
          { error: 'دسترسی غیرمجاز' },
          { status: 401 }
        );
      }

      if (!user.isAdmin) {
        return NextResponse.json(
          { error: 'دسترسی محدود - فقط ادمین' },
          { status: 403 }
        );
      }

      const result = await handler(request, user);
      return result;
    } catch (error) {
      console.error('RequireAdmin error:', error);
      return NextResponse.json(
        { error: 'خطای سرور' },
        { status: 500 }
      );
    }
  };
}
