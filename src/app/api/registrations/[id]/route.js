import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// DELETE /api/registrations/[id] - Cancel registration
export async function DELETE(request, { params }) {
  return await requireAuth(async (request, user) => {
    try {
      const { id } = await params;

      // Find the registration
      const registration = await prisma.eventRegistration.findUnique({
        where: { id: parseInt(id) },
        include: {
          event: {
            select: {
              title: true,
              startDateTime: true,
              registrationEnd: true
            }
          }
        }
      });

      if (!registration) {
        return NextResponse.json(
          { error: 'ثبت نام یافت نشد' },
          { status: 404 }
        );
      }

      // Check if user owns this registration
      if (registration.userId !== user.id) {
        return NextResponse.json(
          { error: 'شما مجاز به لغو این ثبت نام نیستید' },
          { status: 403 }
        );
      }

      // Check if registration can be cancelled
      const now = new Date();
      const eventStart = new Date(registration.event.startDateTime);
      const registrationEnd = new Date(registration.event.registrationEnd);

      // Can't cancel if event has already started
      if (eventStart <= now) {
        return NextResponse.json(
          { error: 'نمی‌توان ثبت نام رویداد شروع شده را لغو کرد' },
          { status: 400 }
        );
      }

      // Can't cancel if registration period has ended (optional rule)
      if (registrationEnd <= now) {
        return NextResponse.json(
          { error: 'زمان لغو ثبت نام به پایان رسیده است' },
          { status: 400 }
        );
      }

      // Update registration status to CANCELLED instead of deleting
      const updatedRegistration = await prisma.eventRegistration.update({
        where: { id: parseInt(id) },
        data: { 
          status: 'CANCELLED',
          updatedAt: new Date()
        }
      });

      return NextResponse.json({
        success: true,
        message: `ثبت نام در "${registration.event.title}" با موفقیت لغو شد`,
        registration: updatedRegistration
      });

    } catch (error) {
      console.error('Cancel registration error:', error);
      return NextResponse.json(
        { error: 'خطای سرور' },
        { status: 500 }
      );
    }
  })(request);
}

// GET /api/registrations/[id] - Get registration details
export async function GET(request, { params }) {
  return await requireAuth(async (request, user) => {
    try {
      const { id } = await params;

      const registration = await prisma.eventRegistration.findUnique({
        where: { id: parseInt(id) },
        include: {
          event: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true
            }
          }
        }
      });

      if (!registration) {
        return NextResponse.json(
          { error: 'ثبت نام یافت نشد' },
          { status: 404 }
        );
      }

      // Check if user owns this registration or is admin
      if (registration.userId !== user.id && !user.isAdmin) {
        return NextResponse.json(
          { error: 'دسترسی غیرمجاز' },
          { status: 403 }
        );
      }

      return NextResponse.json({
        success: true,
        registration
      });

    } catch (error) {
      console.error('Get registration error:', error);
      return NextResponse.json(
        { error: 'خطای سرور' },
        { status: 500 }
      );
    }
  })(request);
}
