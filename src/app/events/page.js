'use client';

import { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Clock, DollarSign, Eye, UserCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button.jsx';
import OpenMapDisplay from '@/components/OpenMapDisplay';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { formatDate, formatTime } from '@/lib/utils';

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      const data = await response.json();
      
      if (data.success) {
        setEvents(data.events);
      } else {
        toast.error('خطا در بارگیری رویدادها');
      }
    } catch (error) {
      console.error('Fetch events error:', error);
      toast.error('خطا در بارگیری رویدادها');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (eventId) => {
    if (!user) {
      toast.error('برای ثبت نام ابتدا وارد شوید');
      return;
    }

    setRegistering(eventId);
    try {
      const response = await fetch(`/api/events/${eventId}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        fetchEvents(); // Refresh events to update registration counts
      } else {
        toast.error(data.error || 'خطا در ثبت نام');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('خطا در ثبت نام');
    } finally {
      setRegistering(null);
    }
  };

  const formatPrice = (price) => {
    if (price === 0) return 'رایگان';
    return `${price.toLocaleString('fa-IR')} تومان`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-muted rounded w-96 mx-auto mb-8"></div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-card rounded-lg p-6 border border-border">
                    <div className="h-6 bg-muted rounded mb-4"></div>
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-4 bg-muted rounded mb-4"></div>
                    <div className="h-10 bg-muted rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="px-4 py-4 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-2">رویدادهای دویدن</h1>
        <p className="text-sm text-muted-foreground">در رویدادهای هیجان‌انگیز دویدن شرکت کنید</p>
      </div>

      {/* Events Grid */}
      <div className="px-4">
        {events.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-muted rounded-full p-4 w-16 h-16 mx-auto mb-4">
              <Calendar className="h-8 w-8 text-muted-foreground mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">هیچ رویدادی یافت نشد</h3>
            <p className="text-muted-foreground">در حال حاضر رویدادی برای نمایش وجود ندارد</p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event.id} className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-bold text-card-foreground flex-1">{event.title}</h3>
                    <span className={`text-sm font-semibold ${event.price === 0 ? 'text-accent' : 'text-foreground'}`}>
                      {formatPrice(event.price)}
                    </span>
                  </div>
                  
                  {event.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{event.description}</p>
                  )}

                  {/* OpenStreetMap */}
                  <div className="mb-4">
                    <OpenMapDisplay
                      latitude={event.latitude}
                      longitude={event.longitude}
                      address={event.address}
                      title={event.title}
                      showDirections={true}
                    />
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 ml-2 flex-shrink-0" />
                      <span>{formatDate(event.startDateTime)} - {formatTime(event.startDateTime)}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 ml-2 flex-shrink-0" />
                      <span className="line-clamp-1">{event.address}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 ml-2" />
                        <span>
                          {event.registeredCount} نفر ثبت نام کرده
                          {event.maxParticipants && ` از ${event.maxParticipants}`}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 ml-2" />
                        <span className="text-xs">
                          تا: {formatDate(event.registrationEnd)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {/* Show registration status */}
                    {event.userRegistered && (
                      <div className="flex items-center gap-2 text-xs text-accent bg-accent/10 px-2 py-1 rounded">
                        <UserCheck className="h-3 w-3" />
                        <span>ثبت نام شده</span>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-2">
                      {event.userRegistered ? (
                        <>
                          <Link href={`/events/${event.id}`} className="flex-1">
                            <Button variant="outline" className="w-full" size="sm">
                              <Eye className="h-4 w-4 ml-1" />
                              جزئیات
                            </Button>
                          </Link>
                        </>
                      ) : !event.registrationOpen ? (
                        <>
                          <Link href={`/events/${event.id}`} className="flex-1">
                            <Button variant="outline" className="w-full" size="sm">
                              <Eye className="h-4 w-4 ml-1" />
                              جزئیات
                            </Button>
                          </Link>
                          <Button disabled className="flex-1" size="sm">
                            ثبت نام بسته
                          </Button>
                        </>
                      ) : event.isFull ? (
                        <>
                          <Link href={`/events/${event.id}`} className="flex-1">
                            <Button variant="outline" className="w-full" size="sm">
                              <Eye className="h-4 w-4 ml-1" />
                              جزئیات
                            </Button>
                          </Link>
                          <Button disabled className="flex-1" size="sm">
                            ظرفیت تکمیل
                          </Button>
                        </>
                      ) : !user ? (
                        <>
                          <Link href={`/events/${event.id}`} className="flex-1">
                            <Button variant="outline" className="w-full" size="sm">
                              <Eye className="h-4 w-4 ml-1" />
                              جزئیات
                            </Button>
                          </Link>
                          <Button 
                            variant="outline" 
                            className="flex-1"
                            size="sm"
                            onClick={() => toast.error('برای ثبت نام ابتدا وارد شوید')}
                          >
                            ورود برای ثبت نام
                          </Button>
                        </>
                      ) : (
                        <>
                          <Link href={`/events/${event.id}`} className="flex-1">
                            <Button variant="outline" className="w-full" size="sm">
                              <Eye className="h-4 w-4 ml-1" />
                              جزئیات
                            </Button>
                          </Link>
                          <Button 
                            className="flex-1"
                            size="sm"
                            onClick={() => handleRegister(event.id)}
                            disabled={registering === event.id}
                          >
                            {registering === event.id ? 'در حال ثبت نام...' : 'ثبت نام'}
                          </Button>
                        </>
                      )}
                    </div>
                    
                    {event.availableSpots !== null && event.availableSpots <= 5 && event.availableSpots > 0 && (
                      <p className="text-xs text-orange-600 text-center">
                        تنها {event.availableSpots} جای خالی باقی مانده!
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
