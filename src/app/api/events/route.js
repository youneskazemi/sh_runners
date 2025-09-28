import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, requireAdmin } from '@/lib/auth';
import jwt from 'jsonwebtoken';

// GET /api/events - Get all active events
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Get user ID from auth token if available
    let currentUserId = null;
    try {
      const token = request.cookies.get('auth-token')?.value;
      if (token) {
        const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET);
        currentUserId = decoded.userId;
      }
    } catch (error) {
      // User not authenticated, continue without user context
    }

    const events = await prisma.event.findMany({
      where: {
        isActive: true,
        startDateTime: {
          gte: new Date() // Only future events
        }
      },
      orderBy: {
        startDateTime: 'asc'
      },
      skip,
      take: limit,
      include: {
        registrations: {
          select: {
            id: true,
            status: true,
            userId: true
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

    // Calculate available spots and user registration status for each event
    const eventsWithAvailability = events.map(event => {
      // Check if current user is registered for this event
      const userRegistration = currentUserId ? 
        event.registrations.find(reg => reg.userId === currentUserId && reg.status === 'CONFIRMED') : 
        null;

      return {
        ...event,
        registeredCount: event._count.registrations,
        availableSpots: event.maxParticipants ? event.maxParticipants - event._count.registrations : null,
        isFull: event.maxParticipants ? event._count.registrations >= event.maxParticipants : false,
        registrationOpen: new Date() < new Date(event.registrationEnd),
        userRegistered: !!userRegistration,
        userRegistrationId: userRegistration?.id || null
      };
    });

    const totalEvents = await prisma.event.count({
      where: {
        isActive: true,
        startDateTime: {
          gte: new Date()
        }
      }
    });

    return NextResponse.json({
      success: true,
      events: eventsWithAvailability,
      pagination: {
        page,
        limit,
        total: totalEvents,
        pages: Math.ceil(totalEvents / limit)
      }
    });

  } catch (error) {
    console.error('Get events error:', error);
    return NextResponse.json(
      { error: 'خطای سرور' },
      { status: 500 }
    );
  }
}

// POST /api/events - Create new event (Admin only)
export async function POST(request) {
  return await requireAdmin(async (request) => {
    try {
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
        price
      } = await request.json();

      // Validate required fields
      if (!title || !address || !latitude || !longitude || !startDateTime || !registrationEnd) {
        return NextResponse.json(
          { error: 'تمام فیلدهای اجباری را پر کنید' },
          { status: 400 }
        );
      }

      // Validate dates
      const start = new Date(startDateTime);
      const end = endDateTime ? new Date(endDateTime) : start; // Use start time as end time if not provided
      const regEnd = new Date(registrationEnd);
      const now = new Date();

      if (start <= now) {
        return NextResponse.json(
          { error: 'زمان شروع رویداد باید در آینده باشد' },
          { status: 400 }
        );
      }

      if (regEnd >= start) {
        return NextResponse.json(
          { error: 'زمان پایان ثبت نام باید قبل از شروع رویداد باشد' },
          { status: 400 }
        );
      }

      const event = await prisma.event.create({
        data: {
          title,
          description,
          address,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          startDateTime: start,
          endDateTime: end,
          registrationEnd: regEnd,
          maxParticipants: maxParticipants ? parseInt(maxParticipants) : null,
          price: parseFloat(price || 0)
        }
      });

      return NextResponse.json({
        success: true,
        message: 'رویداد با موفقیت ایجاد شد',
        event
      });

    } catch (error) {
      console.error('Create event error:', error);
      return NextResponse.json(
        { error: 'خطای سرور' },
        { status: 500 }
      );
    }
  })(request);
}
