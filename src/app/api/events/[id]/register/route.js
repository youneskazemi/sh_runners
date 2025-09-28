import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// POST /api/events/[id]/register - Register for event
export async function POST(request, { params }) {
  return await requireAuth(async (request, user) => {
    try {
      const { id } = await params;
      const eventId = parseInt(id);

      // Get event details
      const event = await prisma.event.findUnique({
        where: {
          id: eventId,
          isActive: true
        },
        include: {
          _count: {
            select: {
              registrations: {
                where: {
                  status: 'CONFIRMED'
                }
              }
            }
          }
        }
      });

      if (!event) {
        return NextResponse.json(
          { error: 'رویداد یافت نشد' },
          { status: 404 }
        );
      }

      // Check if registration is still open
      if (new Date() >= new Date(event.registrationEnd)) {
        return NextResponse.json(
          { error: 'زمان ثبت نام به پایان رسیده است' },
          { status: 400 }
        );
      }

      // Check if event is full
      if (event.maxParticipants && event._count.registrations >= event.maxParticipants) {
        return NextResponse.json(
          { error: 'ظرفیت رویداد تکمیل شده است' },
          { status: 400 }
        );
      }

      // Check if user is already registered
      const existingRegistration = await prisma.eventRegistration.findFirst({
        where: {
          eventId,
          userId: user.id
        }
      });

      if (existingRegistration) {
        if (existingRegistration.status === 'CONFIRMED') {
          return NextResponse.json(
            { error: 'شما قبلاً در این رویداد ثبت نام کرده‌اید' },
            { status: 400 }
          );
        } else if (existingRegistration.status === 'PENDING') {
          return NextResponse.json(
            { error: 'ثبت نام شما در انتظار تایید است' },
            { status: 400 }
          );
        }
      }

      // Create registration
      const registration = await prisma.eventRegistration.create({
        data: {
          eventId,
          userId: user.id,
          status: event.price > 0 ? 'PENDING' : 'CONFIRMED', // If free, auto-confirm
          registeredAt: new Date()
        },
        include: {
          event: {
            select: {
              title: true,
              price: true
            }
          }
        }
      });

      // If event has a price, create payment record
      if (event.price > 0) {
        await prisma.payment.create({
          data: {
            registrationId: registration.id,
            amount: event.price,
            status: 'PENDING'
          }
        });
      }

      return NextResponse.json({
        success: true,
        message: event.price > 0 
          ? 'ثبت نام شما ثبت شد. لطفا پرداخت را انجام دهید'
          : 'ثبت نام شما با موفقیت تایید شد',
        registration: {
          id: registration.id,
          status: registration.status,
          needsPayment: event.price > 0,
          amount: event.price
        }
      });

    } catch (error) {
      console.error('Event registration error:', error);
      return NextResponse.json(
        { error: 'خطای سرور' },
        { status: 500 }
      );
    }
  })(request);
}

// DELETE /api/events/[id]/register - Cancel registration
export async function DELETE(request, { params }) {
  return await requireAuth(async (request, user) => {
    try {
      const { id } = await params;
      const eventId = parseInt(id);

      // Find user's registration
      const registration = await prisma.eventRegistration.findFirst({
        where: {
          eventId,
          userId: user.id
        },
        include: {
          event: true,
          payment: true
        }
      });

      if (!registration) {
        return NextResponse.json(
          { error: 'شما در این رویداد ثبت نام نکرده‌اید' },
          { status: 404 }
        );
      }

      // Check if event has already started
      if (new Date() >= new Date(registration.event.startDateTime)) {
        return NextResponse.json(
          { error: 'نمی‌توان پس از شروع رویداد، ثبت نام را لغو کرد' },
          { status: 400 }
        );
      }

      // Cancel registration
      await prisma.eventRegistration.update({
        where: { id: registration.id },
        data: { status: 'CANCELLED' }
      });

      // Cancel payment if exists
      if (registration.payment) {
        await prisma.payment.update({
          where: { id: registration.payment.id },
          data: { status: 'CANCELLED' }
        });
      }

      return NextResponse.json({
        success: true,
        message: 'ثبت نام شما با موفقیت لغو شد'
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
