import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    const { phone, otp, firstName, lastName } = await request.json();

    // Validate required fields
    if (!phone || !otp || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'تمام فیلدها الزامی است' },
        { status: 400 }
      );
    }

    // Find the verified OTP record
    const otpRecord = await prisma.otpCode.findFirst({
      where: {
        phone,
        code: otp,
        verified: true,
        expiresAt: {
          gt: new Date(Date.now() - 10 * 60 * 1000) // Allow 10 minutes for profile completion
        }
      }
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: 'جلسه منقضی شده است. لطفا دوباره تلاش کنید' },
        { status: 400 }
      );
    }

    // Create new user
    const user = await prisma.user.create({
      data: {
        phone,
        firstName,
        lastName
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id,
        phone: user.phone,
        isAdmin: user.isAdmin
      },
      process.env.NEXTAUTH_SECRET,
      { expiresIn: '7d' }
    );

    // Create response with token in httpOnly cookie
    const response = NextResponse.json({
      success: true,
      message: 'ثبت نام با موفقیت انجام شد',
      user: {
        id: user.id,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        isAdmin: user.isAdmin
      }
    });

    // Set httpOnly cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    // Clean up used OTP
    await prisma.otpCode.delete({
      where: { id: otpRecord.id }
    });

    return response;

  } catch (error) {
    console.error('Complete profile error:', error);
    return NextResponse.json(
      { error: 'خطای سرور' },
      { status: 500 }
    );
  }
}
