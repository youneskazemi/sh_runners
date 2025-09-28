import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// GET /api/profile - Get user profile with registrations
export async function GET(request) {
  return await requireAuth(async (request, user) => {
    try {
      console.log('Profile API called');
      console.log('User object received:', user);
      console.log('User ID:', user?.id);
      
      // Validate user object and ID
      if (!user) {
        console.error('No user object received from requireAuth');
        return NextResponse.json(
          { error: 'کاربر یافت نشد' },
          { status: 401 }
        );
      }

      if (!user.id) {
        console.error('User object missing ID:', user);
        return NextResponse.json(
          { error: 'شناسه کاربر نامعتبر است' },
          { status: 401 }
        );
      }

      console.log('Profile API called for user:', user.id);
      
      // First, just get the user profile without complex relations
      const userProfile = await prisma.user.findUnique({
        where: { id: user.id }
      });

      if (!userProfile) {
        console.log('User profile not found in database for ID:', user.id);
        return NextResponse.json(
          { error: 'کاربر یافت نشد' },
          { status: 404 }
        );
      }

      console.log('User profile found:', userProfile.firstName);

      // Get registrations separately
      const registrations = await prisma.eventRegistration.findMany({
        where: { userId: user.id },
        include: {
          event: {
            select: {
              id: true,
              title: true,
              description: true,
              address: true,
              latitude: true,
              longitude: true,
              startDateTime: true,
              endDateTime: true,
              registrationEnd: true,
              maxParticipants: true,
              price: true,
              isActive: true
            }
          }
        },
        orderBy: {
          registeredAt: 'desc'
        }
      });

      console.log('Found registrations:', registrations.length);

      // Separate upcoming and past events
      const now = new Date();
      const upcomingEvents = [];
      const pastEvents = [];

      registrations.forEach(registration => {
        const eventData = {
          ...registration,
          event: {
            ...registration.event,
            isPast: new Date(registration.event.startDateTime) < now,
            registrationOpen: new Date(registration.event.registrationEnd) > now
          }
        };

        if (new Date(registration.event.startDateTime) >= now) {
          upcomingEvents.push(eventData);
        } else {
          pastEvents.push(eventData);
        }
      });

      // Calculate stats
      const stats = {
        totalRegistrations: registrations.length,
        upcomingEvents: upcomingEvents.length,
        pastEvents: pastEvents.length,
        confirmedRegistrations: registrations.filter(r => r.status === 'CONFIRMED').length
      };

      console.log('Returning profile data with stats:', stats);

      return NextResponse.json({
        success: true,
        profile: {
          id: userProfile.id,
          phone: userProfile.phone,
          firstName: userProfile.firstName,
          lastName: userProfile.lastName,
          isAdmin: userProfile.isAdmin,
          createdAt: userProfile.createdAt,
          updatedAt: userProfile.updatedAt
        },
        upcomingEvents,
        pastEvents,
        stats
      });

    } catch (error) {
      console.error('Get profile error:', error);
      console.error('Error stack:', error.stack);
      return NextResponse.json(
        { error: 'خطای سرور' },
        { status: 500 }
      );
    }
  })(request);
}

// PUT /api/profile - Update user profile  
export async function PUT(request) {
  return await requireAuth(async (request, user) => {
    try {
      console.log('PUT Profile API called');
      console.log('User object received:', user);
      console.log('User ID:', user?.id);
      
      // Validate user object and ID
      if (!user) {
        console.error('No user object received from requireAuth');
        return NextResponse.json(
          { error: 'کاربر یافت نشد' },
          { status: 401 }
        );
      }

      if (!user.id) {
        console.error('User object missing ID:', user);
        return NextResponse.json(
          { error: 'شناسه کاربر نامعتبر است' },
          { status: 401 }
        );
      }

      const { firstName, lastName } = await request.json();

      // Validate input
      if (!firstName || !lastName) {
        return NextResponse.json(
          { error: 'نام و نام خانوادگی الزامی است' },
          { status: 400 }
        );
      }

      if (firstName.length < 2 || lastName.length < 2) {
        return NextResponse.json(
          { error: 'نام و نام خانوادگی باید حداقل 2 کاراکتر باشد' },
          { status: 400 }
        );
      }

      // Update user profile
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          firstName: firstName.trim(),
          lastName: lastName.trim()
        }
      });

      return NextResponse.json({
        success: true,
        message: 'پروفایل با موفقیت به‌روزرسانی شد',
        user: {
          id: updatedUser.id,
          phone: updatedUser.phone,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          isAdmin: updatedUser.isAdmin
        }
      });

    } catch (error) {
      console.error('Update profile error:', error);
      console.error('Error stack:', error.stack);
      return NextResponse.json(
        { error: 'خطای سرور' },
        { status: 500 }
      );
    }
  })(request);
}