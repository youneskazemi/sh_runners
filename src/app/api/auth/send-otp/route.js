import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
  try {
    const { phone } = await request.json();

    // Validate phone number format
    if (!phone || !phone.match(/^09\d{9}$/)) {
      return NextResponse.json(
        { error: 'شماره تلفن نامعتبر است' },
        { status: 400 }
      );
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiration time (5 minutes from now)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Delete any existing OTP codes for this phone number
    await prisma.otpCode.deleteMany({
      where: { phone }
    });

    // Create new OTP record
    await prisma.otpCode.create({
      data: {
        phone,
        code: otpCode,
        expiresAt,
        verified: false
      }
    });

    // Log OTP to console (for development/testing)
    console.log(`🔐 OTP for ${phone}: ${otpCode}`);
    console.log(`📱 کد تایید برای شماره ${phone}: ${otpCode}`);
    
    return NextResponse.json({
      success: true,
      message: 'کد تایید ارسال شد',
      // Return the OTP for easy testing
      devOtp: otpCode
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { error: 'خطای سرور' },
      { status: 500 }
    );
  }
}
