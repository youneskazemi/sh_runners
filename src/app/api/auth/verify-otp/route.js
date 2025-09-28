import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    const { phone, otp, firstName, lastName } = await request.json();

    // Validate required fields
    if (!phone || !otp) {
      return NextResponse.json(
        { error: 'شماره تلفن و کد تایید الزامی است' },
        { status: 400 }
      );
    }

    // Find the OTP record
    const otpRecord = await prisma.otpCode.findFirst({
      where: {
        phone,
        code: otp,
        verified: false,
        expiresAt: {
          gt: new Date()
        }
      }
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: 'کد تایید نامعتبر یا منقضی شده است' },
        { status: 400 }
      );
    }

    // Mark OTP as verified
    await prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { verified: true }
    });

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { phone }
    });

    if (!user) {
      // Create new user if doesn't exist
      if (!firstName || !lastName) {
        return NextResponse.json(
          { 
            success: true,
            requiresProfile: true,
            message: 'لطفا نام و نام خانوادگی خود را وارد کنید'
          }
        );
      }

      user = await prisma.user.create({
        data: {
          phone,
          firstName,
          lastName
        }
      });
    } else {
      // User already exists, no need to update
      // The OTP verification is handled by marking the OTP as verified
    }

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
      message: 'ورود موفقیت‌آمیز',
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

    return response;

  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { error: 'خطای سرور' },
      { status: 500 }
    );
  }
}
