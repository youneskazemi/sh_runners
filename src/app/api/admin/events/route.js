import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

// GET /api/admin/events - Get all events (including inactive) for admin
export async function GET(request) {
  return await requireAdmin(async (request) => {
    try {
      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '50');
      const skip = (page - 1) * limit;

      const events = await prisma.event.findMany({
        orderBy: [
          { isActive: 'desc' },
          { startDateTime: 'desc' }
        ],
        skip,
        take: limit,
        include: {
          registrations: {
            select: {
              id: true,
              status: true,
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  phone: true
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

      // Calculate availability for each event
      const eventsWithAvailability = events.map(event => ({
        ...event,
        registeredCount: event._count.registrations,
        availableSpots: event.maxParticipants ? event.maxParticipants - event._count.registrations : null,
        isFull: event.maxParticipants ? event._count.registrations >= event.maxParticipants : false,
        registrationOpen: new Date() < new Date(event.registrationEnd)
      }));

      const totalEvents = await prisma.event.count();

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
      console.error('Admin get events error:', error);
      return NextResponse.json(
        { error: 'خطای سرور' },
        { status: 500 }
      );
    }
  })(request);
}
