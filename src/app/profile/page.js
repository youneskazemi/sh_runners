'use client';

import { useState, useEffect } from 'react';
import { User, Calendar, MapPin, Clock, Edit3, Trash2, Eye, UserCheck, Trophy, Activity } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog.jsx';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { formatDate, formatTime } from '@/lib/utils';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '' });
  const [updating, setUpdating] = useState(false);
  const [cancelling, setCancelling] = useState(null);
  const { user, updateUser } = useAuth();

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const text = await response.text();
      if (!text) {
        throw new Error('Empty response from server');
      }
      
      let data;
      try {
        data = JSON.parse(text);
      } catch (jsonError) {
        console.error('JSON parse error:', jsonError, 'Response:', text);
        throw new Error('Invalid JSON response from server');
      }
      
      if (data.success) {
        setProfile(data.profile);
        setUpcomingEvents(data.upcomingEvents);
        setPastEvents(data.pastEvents);
        setStats(data.stats);
        setEditForm({
          firstName: data.profile.firstName,
          lastName: data.profile.lastName
        });
      } else {
        toast.error(data.error || 'خطا در بارگیری پروفایل');
      }
    } catch (error) {
      console.error('Fetch profile error:', error);
      toast.error('خطا در بارگیری پروفایل');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    if (!editForm.firstName.trim() || !editForm.lastName.trim()) {
      toast.error('نام و نام خانوادگی الزامی است');
      return;
    }

    setUpdating(true);
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        setProfile(prev => ({ ...prev, ...data.user }));
        updateUser(data.user); // Update auth context
        setShowEditModal(false);
      } else {
        toast.error(data.error || 'خطا در به‌روزرسانی پروفایل');
      }
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error('خطا در به‌روزرسانی پروفایل');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelRegistration = async (registrationId, eventTitle) => {
    if (!confirm(`آیا از لغو ثبت نام در "${eventTitle}" اطمینان دارید؟`)) {
      return;
    }

    setCancelling(registrationId);
    try {
      const response = await fetch(`/api/registrations/${registrationId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        fetchProfile(); // Refresh data
      } else {
        toast.error(data.error || 'خطا در لغو ثبت نام');
      }
    } catch (error) {
      console.error('Cancel registration error:', error);
      toast.error('خطا در لغو ثبت نام');
    } finally {
      setCancelling(null);
    }
  };

  const formatPrice = (price) => {
    if (price === 0) return 'رایگان';
    return `${price.toLocaleString('fa-IR')} تومان`;
  };

  const getStatusBadge = (registration) => {
    const { status } = registration;
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
      COMPLETED: 'bg-blue-100 text-blue-800'
    };

    const labels = {
      PENDING: 'در انتظار',
      CONFIRMED: 'تایید شده',
      CANCELLED: 'لغو شده',
      COMPLETED: 'تکمیل شده'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}>
        {labels[status]}
      </span>
    );
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h2 className="text-xl font-bold text-foreground mb-2">برای مشاهده پروفایل وارد شوید</h2>
          <Button onClick={() => window.location.href = '/'}>
            ورود
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4 px-4 py-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/2 mb-4"></div>
          <div className="h-32 bg-muted rounded mb-4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-card rounded-lg p-6 border border-border">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-card-foreground">
                {profile?.firstName} {profile?.lastName}
              </h1>
              <p className="text-muted-foreground">{profile?.phone}</p>
              {profile?.isAdmin && (
                <span className="inline-flex items-center gap-1 bg-accent/10 text-accent px-2 py-1 rounded-full text-xs font-medium mt-1">
                  <Trophy className="h-3 w-3" />
                  مدیر
                </span>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowEditModal(true)}
          >
            <Edit3 className="h-4 w-4 ml-1" />
            ویرایش
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{stats.totalRegistrations || 0}</div>
            <div className="text-xs text-muted-foreground">کل ثبت نام‌ها</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">{stats.upcomingEvents || 0}</div>
            <div className="text-xs text-muted-foreground">رویدادهای آینده</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-muted-foreground">{stats.pastEvents || 0}</div>
            <div className="text-xs text-muted-foreground">رویدادهای گذشته</div>
          </div>
        </div>
      </div>

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-foreground px-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-accent" />
            رویدادهای آینده ({upcomingEvents.length})
          </h2>
          
          <div className="space-y-3">
            {upcomingEvents.map((registration) => (
              <div key={registration.id} className="bg-card rounded-lg p-4 border border-border">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-card-foreground mb-1">
                      {registration.event.title}
                    </h3>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(registration.event.startDateTime)} - {formatTime(registration.event.startDateTime)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        <span className="line-clamp-1">{registration.event.address}</span>
                      </div>
                    </div>
                  </div>
                  {getStatusBadge(registration)}
                </div>

                <div className="flex gap-2">
                  <Link href={`/events/${registration.event.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="h-4 w-4 ml-1" />
                      جزئیات
                    </Button>
                  </Link>
                  
                  {registration.status === 'CONFIRMED' && registration.event.registrationOpen && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleCancelRegistration(registration.id, registration.event.title)}
                      disabled={cancelling === registration.id}
                      className="flex-1"
                    >
                      {cancelling === registration.id ? (
                        'در حال لغو...'
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4 ml-1" />
                          لغو ثبت نام
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-foreground px-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            رویدادهای گذشته ({pastEvents.length})
          </h2>
          
          <div className="space-y-3">
            {pastEvents.slice(0, 5).map((registration) => (
              <div key={registration.id} className="bg-card rounded-lg p-4 border border-border opacity-75">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-medium text-card-foreground mb-1">
                      {registration.event.title}
                    </h3>
                    <div className="text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(registration.event.startDateTime)}</span>
                      </div>
                    </div>
                  </div>
                  {getStatusBadge(registration)}
                </div>
              </div>
            ))}
            
            {pastEvents.length > 5 && (
              <p className="text-center text-sm text-muted-foreground">
                و {pastEvents.length - 5} رویداد دیگر...
              </p>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {upcomingEvents.length === 0 && pastEvents.length === 0 && (
        <div className="text-center py-12">
          <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            هنوز در هیچ رویدادی ثبت نام نکرده‌اید
          </h3>
          <p className="text-muted-foreground mb-4">
            برای مشاهده رویدادهای موجود و ثبت نام کلیک کنید
          </p>
          <Link href="/events">
            <Button>
              مشاهده رویدادها
            </Button>
          </Link>
        </div>
      )}

      {/* Edit Profile Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>ویرایش پروفایل</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                نام *
              </label>
              <Input
                value={editForm.firstName}
                onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                placeholder="نام خود را وارد کنید"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                نام خانوادگی *
              </label>
              <Input
                value={editForm.lastName}
                onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                placeholder="نام خانوادگی خود را وارد کنید"
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEditModal(false)}
                className="flex-1"
              >
                انصراف
              </Button>
              <Button
                type="submit"
                disabled={updating}
                className="flex-1"
              >
                {updating ? 'در حال ذخیره...' : 'ذخیره'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
