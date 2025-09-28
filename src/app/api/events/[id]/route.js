import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, requireAdmin } from '@/lib/auth';

// GET /api/events/[id] - Get single event
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const event = await prisma.event.findUnique({
      where: {
        id: parseInt(id),
        isActive: true
      },
      include: {
        registrations: {
          where: {
            status: 'CONFIRMED'
          },
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        },
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

    const eventWithAvailability = {
      ...event,
      registeredCount: event._count.registrations,
      availableSpots: event.maxParticipants ? event.maxParticipants - event._count.registrations : null,
      isFull: event.maxParticipants ? event._count.registrations >= event.maxParticipants : false,
      registrationOpen: new Date() < new Date(event.registrationEnd)
    };

    return NextResponse.json({
      success: true,
      event: eventWithAvailability
    });

  } catch (error) {
    console.error('Get event error:', error);
    return NextResponse.json(
      { error: 'خطای سرور' },
      { status: 500 }
    );
  }
}

// PUT /api/events/[id] - Update event (Admin only)
export async function PUT(request, { params }) {
  return await requireAdmin(async (request) => {
    try {
      const { id } = await params;
      const {
        title,
        description,
        address,
        latitude,
        longitude,
        startDateTime,
        endDateTime,
        registrationEnd,
        maxParticipants,
        price,
        isActive
      } = await request.json();

      // Check if event exists
      const existingEvent = await prisma.event.findUnique({
        where: { id: parseInt(id) }
      });

      if (!existingEvent) {
        return NextResponse.json(
          { error: 'رویداد یافت نشد' },
          { status: 404 }
        );
      }

      // Validate dates if provided
      if (startDateTime && registrationEnd) {
        const start = new Date(startDateTime);
        const regEnd = new Date(registrationEnd);

        if (regEnd >= start) {
          return NextResponse.json(
            { error: 'زمان پایان ثبت نام باید قبل از شروع رویداد باشد' },
            { status: 400 }
          );
        }
      }

      const updateData = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (address !== undefined) updateData.address = address;
      if (latitude !== undefined) updateData.latitude = parseFloat(latitude);
      if (longitude !== undefined) updateData.longitude = parseFloat(longitude);
      if (startDateTime !== undefined) updateData.startDateTime = new Date(startDateTime);
      if (endDateTime !== undefined) updateData.endDateTime = new Date(endDateTime);
      if (registrationEnd !== undefined) updateData.registrationEnd = new Date(registrationEnd);
      if (maxParticipants !== undefined) updateData.maxParticipants = maxParticipants ? parseInt(maxParticipants) : null;
      if (price !== undefined) updateData.price = parseFloat(price);
      if (isActive !== undefined) updateData.isActive = isActive;

      const event = await prisma.event.update({
        where: { id: parseInt(id) },
        data: updateData
      });

      return NextResponse.json({
        success: true,
        message: 'رویداد با موفقیت به‌روزرسانی شد',
        event
      });

    } catch (error) {
      console.error('Update event error:', error);
      return NextResponse.json(
        { error: 'خطای سرور' },
        { status: 500 }
      );
    }
  })(request);
}

// DELETE /api/events/[id] - Delete event (Admin only)
export async function DELETE(request, { params }) {
  return await requireAdmin(async (request) => {
    try {
      const { id } = await params;

      // Check if event exists
      const existingEvent = await prisma.event.findUnique({
        where: { id: parseInt(id) },
        include: {
          _count: {
            select: {
              registrations: true
            }
          }
        }
      });

      if (!existingEvent) {
        return NextResponse.json(
          { error: 'رویداد یافت نشد' },
          { status: 404 }
        );
      }

      // Soft delete - just mark as inactive if there are registrations
      if (existingEvent._count.registrations > 0) {
        await prisma.event.update({
          where: { id: parseInt(id) },
          data: { isActive: false }
        });

        return NextResponse.json({
          success: true,
          message: 'رویداد غیرفعال شد (به دلیل وجود ثبت‌نام‌ها)'
        });
      } else {
        // Hard delete if no registrations
        await prisma.event.delete({
          where: { id: parseInt(id) }
        });

        return NextResponse.json({
          success: true,
          message: 'رویداد با موفقیت حذف شد'
        });
      }

    } catch (error) {
      console.error('Delete event error:', error);
      return NextResponse.json(
        { error: 'خطای سرور' },
        { status: 500 }
      );
    }
  })(request);
}
