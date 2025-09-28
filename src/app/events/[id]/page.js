'use client';

import { useState, useEffect, use } from 'react';
import { Calendar, MapPin, Users, Clock, DollarSign, ArrowRight, UserCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button.jsx';
import OpenMapDisplay from '@/components/OpenMapDisplay';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { formatDate, formatTime } from '@/lib/utils';

export default function EventDetailPage({ params }) {
  const resolvedParams = use(params);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchEvent();
  }, [resolvedParams.id]);

  const fetchEvent = async () => {
    try {
      const response = await fetch(`/api/events/${resolvedParams.id}`);
      const data = await response.json();
      
      if (data.success) {
        setEvent(data.event);
      } else {
        toast.error('رویداد یافت نشد');
        router.push('/events');
      }
    } catch (error) {
      console.error('Fetch event error:', error);
      toast.error('خطا در بارگیری رویداد');
      router.push('/events');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!user) {
      toast.error('برای ثبت نام ابتدا وارد شوید');
      return;
    }

    setRegistering(true);
    try {
      const response = await fetch(`/api/events/${resolvedParams.id}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        fetchEvent(); // Refresh event data
      } else {
        toast.error(data.error || 'خطا در ثبت نام');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('خطا در ثبت نام');
    } finally {
      setRegistering(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (!confirm('آیا از لغو ثبت نام اطمینان دارید؟')) {
      return;
    }

    setCancelling(true);
    try {
      const response = await fetch(`/api/events/${resolvedParams.id}/register`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        fetchEvent(); // Refresh event data
      } else {
        toast.error(data.error || 'خطا در لغو ثبت نام');
      }
    } catch (error) {
      console.error('Cancel registration error:', error);
      toast.error('خطا در لغو ثبت نام');
    } finally {
      setCancelling(false);
    }
  };

  const formatPrice = (price) => {
    if (price === 0) return 'رایگان';
    return `${price.toLocaleString('fa-IR')} تومان`;
  };

  if (loading) {
    return (
      <div className="space-y-4 px-4 py-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-3/4 mb-4"></div>
          <div className="h-64 bg-muted rounded mb-4"></div>
          <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-muted rounded w-2/3 mb-2"></div>
          <div className="h-10 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h2 className="text-xl font-bold text-foreground mb-2">رویداد یافت نشد</h2>
          <Button onClick={() => router.push('/events')}>
            بازگشت به لیست رویدادها
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="px-4 py-4">
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="p-2"
          >
            <ArrowRight className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground flex-1">{event.title}</h1>
        </div>

        {/* Event Status */}
        {event.userRegistered && (
          <div className="bg-accent/10 border border-accent/20 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 text-accent">
              <UserCheck className="h-5 w-5" />
              <span className="font-medium">شما در این رویداد ثبت نام کرده‌اید</span>
            </div>
          </div>
        )}
      </div>

      {/* Event Details */}
      <div className="px-4 space-y-4">
        {/* Description */}
        {event.description && (
          <div className="bg-card rounded-lg p-4 border border-border">
            <h3 className="font-semibold text-card-foreground mb-2">توضیحات</h3>
            <p className="text-muted-foreground leading-relaxed">{event.description}</p>
          </div>
        )}

        {/* Event Info */}
        <div className="bg-card rounded-lg p-4 border border-border space-y-3">
          <h3 className="font-semibold text-card-foreground mb-3">اطلاعات رویداد</h3>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 ml-2 flex-shrink-0" />
            <span>{formatDate(event.startDateTime)} - {formatTime(event.startDateTime)}</span>
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-4 w-4 ml-2 flex-shrink-0" />
            <span>پایان ثبت نام: {formatDate(event.registrationEnd)}</span>
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="h-4 w-4 ml-2 flex-shrink-0" />
            <span>
              {event.registeredCount} نفر ثبت نام کرده
              {event.maxParticipants && ` از ${event.maxParticipants}`}
            </span>
          </div>

          <div className="flex items-center text-sm font-semibold">
            <DollarSign className="h-4 w-4 ml-2 flex-shrink-0" />
            <span className={event.price === 0 ? 'text-accent' : 'text-foreground'}>
              {formatPrice(event.price)}
            </span>
          </div>
        </div>

        {/* Map */}
        <div className="bg-card rounded-lg p-4 border border-border">
          <h3 className="font-semibold text-card-foreground mb-3">موقعیت مکانی</h3>
          <OpenMapDisplay
            latitude={event.latitude}
            longitude={event.longitude}
            address={event.address}
            title={event.title}
            showDirections={true}
          />
        </div>

        {/* Participants List */}
        {event.registrations && event.registrations.length > 0 && (
          <div className="bg-card rounded-lg p-4 border border-border">
            <h3 className="font-semibold text-card-foreground mb-3">
              شرکت کنندگان ({event.registrations.length} نفر)
            </h3>
            <div className="space-y-2">
              {event.registrations.slice(0, 10).map((registration, index) => (
                <div key={registration.id} className="flex items-center gap-3 text-sm">
                  <div className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </div>
                  <span className="text-foreground">
                    {registration.user.firstName} {registration.user.lastName}
                  </span>
                </div>
              ))}
              {event.registrations.length > 10 && (
                <p className="text-xs text-muted-foreground">
                  و {event.registrations.length - 10} نفر دیگر...
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="px-4 pb-6">
        {event.userRegistered ? (
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleCancelRegistration}
            disabled={cancelling}
          >
            {cancelling ? 'در حال لغو...' : 'لغو ثبت نام'}
          </Button>
        ) : !event.registrationOpen ? (
          <Button disabled className="w-full">
            ثبت نام بسته شده
          </Button>
        ) : event.isFull ? (
          <Button disabled className="w-full">
            ظرفیت تکمیل
          </Button>
        ) : !user ? (
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => toast.error('برای ثبت نام ابتدا وارد شوید')}
          >
            ورود برای ثبت نام
          </Button>
        ) : (
          <Button 
            className="w-full"
            onClick={handleRegister}
            disabled={registering}
          >
            {registering ? 'در حال ثبت نام...' : 'ثبت نام در رویداد'}
          </Button>
        )}
        
        {event.availableSpots !== null && event.availableSpots <= 5 && event.availableSpots > 0 && (
          <p className="text-xs text-orange-600 text-center mt-2">
            تنها {event.availableSpots} جای خالی باقی مانده!
          </p>
        )}
      </div>
    </div>
  );
}
