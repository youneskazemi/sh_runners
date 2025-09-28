'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Users, Calendar, MapPin, Clock, DollarSign } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button.jsx';
import toast from 'react-hot-toast';
import { formatDate, formatTime } from '@/lib/utils';
import CreateEventModal from '@/components/CreateEventModal';
import EditEventModal from '@/components/EditEventModal';

export default function AdminPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [deletingEvent, setDeletingEvent] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user && !user.isAdmin) {
      toast.error('شما دسترسی به این صفحه ندارید');
      return;
    }
    fetchEvents();
  }, [user]);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/admin/events');
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

  const handleDeleteEvent = async (eventId) => {
    if (!confirm('آیا از حذف این رویداد اطمینان دارید؟')) {
      return;
    }

    setDeletingEvent(eventId);
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        fetchEvents(); // Refresh events list
      } else {
        toast.error(data.error || 'خطا در حذف رویداد');
      }
    } catch (error) {
      console.error('Delete event error:', error);
      toast.error('خطا در حذف رویداد');
    } finally {
      setDeletingEvent(null);
    }
  };

  const formatPrice = (price) => {
    if (price === 0) return 'رایگان';
    return `${price.toLocaleString('fa-IR')} تومان`;
  };

  const getEventStatus = (event) => {
    const now = new Date();
    const start = new Date(event.startDateTime);
    const regEnd = new Date(event.registrationEnd);

    if (!event.isActive) return { text: 'غیرفعال', color: 'text-gray-500' };
    if (now > start) return { text: 'پایان یافته', color: 'text-gray-600' };
    if (now > regEnd) return { text: 'ثبت نام بسته', color: 'text-orange-600' };
    if (event.isFull) return { text: 'تکمیل ظرفیت', color: 'text-red-600' };
    return { text: 'فعال', color: 'text-green-600' };
  };

  if (!user?.isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h2 className="text-xl font-bold text-foreground mb-2">دسترسی محدود</h2>
          <p className="text-muted-foreground">شما دسترسی به این صفحه ندارید</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4 px-4">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-muted rounded w-32 animate-pulse"></div>
          <div className="h-10 bg-muted rounded w-24 animate-pulse"></div>
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card rounded-lg p-4 border border-border animate-pulse">
            <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="px-4 py-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-foreground">مدیریت رویدادها</h1>
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            رویداد جدید
          </Button>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-card rounded-lg p-3 border border-border">
            <div className="text-2xl font-bold text-primary">{events.length}</div>
            <div className="text-sm text-muted-foreground">کل رویدادها</div>
          </div>
          <div className="bg-card rounded-lg p-3 border border-border">
            <div className="text-2xl font-bold text-accent">
              {events.filter(e => e.isActive && new Date() < new Date(e.startDateTime)).length}
            </div>
            <div className="text-sm text-muted-foreground">رویدادهای فعال</div>
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="px-4">
        {events.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-muted rounded-full p-4 w-16 h-16 mx-auto mb-4">
              <Calendar className="h-8 w-8 text-muted-foreground mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">هیچ رویدادی وجود ندارد</h3>
            <p className="text-muted-foreground mb-4">اولین رویداد خود را ایجاد کنید</p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 ml-2" />
              ایجاد رویداد
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => {
              const status = getEventStatus(event);
              return (
                <div key={event.id} className="bg-card rounded-lg border border-border overflow-hidden">
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-card-foreground mb-1">{event.title}</h3>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-medium ${status.color}`}>
                            {status.text}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatPrice(event.price)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingEvent(event)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteEvent(event.id)}
                          disabled={deletingEvent === event.id}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-muted-foreground">
                        <Calendar className="h-4 w-4 ml-2 flex-shrink-0" />
                        <span>{formatDate(event.startDateTime)} - {formatTime(event.startDateTime)}</span>
                      </div>
                      
                      <div className="flex items-center text-muted-foreground">
                        <MapPin className="h-4 w-4 ml-2 flex-shrink-0" />
                        <span className="line-clamp-1">{event.address}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-muted-foreground">
                          <Users className="h-4 w-4 ml-2" />
                          <span>
                            {event.registeredCount} نفر ثبت نام کرده
                            {event.maxParticipants && ` از ${event.maxParticipants}`}
                          </span>
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <Clock className="h-4 w-4 ml-2" />
                          <span className="text-xs">
                            تا: {formatDate(event.registrationEnd)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateEventModal 
        open={showCreateModal} 
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false);
          fetchEvents();
        }}
      />
      
      {editingEvent && (
        <EditEventModal 
          open={!!editingEvent} 
          event={editingEvent}
          onClose={() => setEditingEvent(null)}
          onSuccess={() => {
            setEditingEvent(null);
            fetchEvents();
          }}
        />
      )}
    </div>
  );
}
