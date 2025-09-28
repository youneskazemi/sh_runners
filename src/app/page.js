'use client';

import { useState, useEffect } from 'react';
import { MapPin, Calendar, Users, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function Home() {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchUpcomingEvents();
  }, []);

  const fetchUpcomingEvents = async () => {
    try {
      const response = await fetch('/api/events?limit=3');
      const data = await response.json();
      
      if (data.success) {
        setUpcomingEvents(data.events);
      }
    } catch (error) {
      console.error('Fetch events error:', error);
    } finally {
      setEventsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="px-4 py-6 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-foreground">
          به دنیای دویدن
          <span className="text-primary"> بپیوندید</span>
        </h2>
        <p className="text-base text-muted-foreground mb-6 leading-relaxed">
          در رویدادهای دویدن شهری شرکت کنید و تجربه‌ای فراموش‌نشدنی داشته باشید
        </p>
      </div>

      {/* Features */}
      <div className="px-4">
        <div className="grid gap-4 mb-6">
          <div className="bg-card rounded-lg p-4 shadow-sm border border-border">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-primary/10 p-2 rounded-lg">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-card-foreground">مکان‌یابی دقیق</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              موقعیت دقیق رویدادها را روی نقشه مشاهده کنید
            </p>
          </div>

          <div className="bg-card rounded-lg p-4 shadow-sm border border-border">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-accent/10 p-2 rounded-lg">
                <Calendar className="h-5 w-5 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-card-foreground">ثبت نام آسان</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              با چند کلیک ساده در رویدادهای مورد علاقه خود ثبت نام کنید
            </p>
          </div>

          <div className="bg-card rounded-lg p-4 shadow-sm border border-border">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-secondary/10 p-2 rounded-lg">
                <Users className="h-5 w-5 text-secondary" />
              </div>
              <h3 className="text-lg font-semibold text-card-foreground">جامعه دوندگان</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              با دوندگان دیگر ارتباط برقرار کنید و تجربیات خود را به اشتراک بگذارید
            </p>
          </div>
        </div>
      </div>

      {/* Upcoming Events Preview */}
      <div className="px-4">
        <div className="bg-card rounded-lg shadow-sm p-4 border border-border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-card-foreground">
              رویدادهای پیش رو
            </h3>
            <Link 
              href="/events"
              className="text-primary hover:text-primary/80 flex items-center gap-1 text-sm font-medium"
            >
              مشاهده همه
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>
          
          {eventsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : upcomingEvents.length === 0 ? (
            <div className="text-center py-8">
              <div className="bg-muted rounded-full p-3 w-12 h-12 mx-auto mb-3">
                <Calendar className="h-6 w-6 text-muted-foreground mx-auto" />
              </div>
              <p className="text-sm text-muted-foreground mb-4">هنوز رویدادی تعریف نشده است</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="border border-border rounded-lg p-3 hover:bg-muted/30 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-card-foreground text-sm">{event.title}</h4>
                    <span className="text-xs text-muted-foreground">
                      {event.price === 0 ? 'رایگان' : `${event.price.toLocaleString('fa-IR')} تومان`}
                    </span>
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground mb-1">
                    <Calendar className="h-3 w-3 ml-1" />
                    <span>{new Date(event.startDateTime).toLocaleDateString('fa-IR')}</span>
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground mb-2">
                    <MapPin className="h-3 w-3 ml-1" />
                    <span className="line-clamp-1">{event.address}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Users className="h-3 w-3 ml-1" />
                      <span>{event.registeredCount} نفر ثبت نام کرده</span>
                    </div>
                    <Link 
                      href="/events"
                      className="text-primary hover:text-primary/80 text-xs font-medium"
                    >
                      جزئیات
                    </Link>
                  </div>
                </div>
              ))}
              <div className="text-center pt-3">
                <Link 
                  href="/events"
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity inline-flex items-center gap-2 text-sm"
                >
                  مشاهده همه رویدادها
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
