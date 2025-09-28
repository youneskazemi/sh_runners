'use client';

import { useState } from 'react';
import { Calendar, MapPin, Users, DollarSign, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import SimpleMapPicker from './SimpleMapPicker';
import toast from 'react-hot-toast';

export default function CreateEventModal({ open, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    address: '',
    latitude: '',
    longitude: '',
    startDateTime: '',
    registrationEnd: '',
    maxParticipants: '',
    price: '0'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.title || !formData.address || !formData.startDateTime || !formData.registrationEnd) {
      toast.error('لطفا تمام فیلدهای اجباری را پر کنید');
      return;
    }

    // Date validation
    const start = new Date(formData.startDateTime);
    const regEnd = new Date(formData.registrationEnd);
    const now = new Date();

    if (start <= now) {
      toast.error('زمان شروع رویداد باید در آینده باشد');
      return;
    }

    if (regEnd >= start) {
      toast.error('زمان پایان ثبت نام باید قبل از شروع رویداد باشد');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          latitude: formData.latitude || 35.6892, // Default Tehran coordinates
          longitude: formData.longitude || 51.3890,
          endDateTime: formData.startDateTime, // Set end time same as start time for now
          maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : null,
          price: parseFloat(formData.price || 0)
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('رویداد با موفقیت ایجاد شد');
        setFormData({
          title: '',
          description: '',
          address: '',
          latitude: '',
          longitude: '',
          startDateTime: '',
          registrationEnd: '',
          maxParticipants: '',
          price: '0'
        });
        onSuccess();
      } else {
        toast.error(data.error || 'خطا در ایجاد رویداد');
      }
    } catch (error) {
      console.error('Create event error:', error);
      toast.error('خطا در ایجاد رویداد');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Format datetime for input
  const formatDateTimeForInput = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().slice(0, 16);
  };

  // Get minimum dates
  const now = new Date();
  const minDateTime = formatDateTimeForInput(now);
  const maxRegEndDateTime = formData.startDateTime ? 
    formatDateTimeForInput(new Date(new Date(formData.startDateTime).getTime() - 60000)) : // 1 minute before start
    '';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">ایجاد رویداد جدید</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              عنوان رویداد *
            </label>
            <Input
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="مثال: دوی صبحگاهی پارک لاله"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              توضیحات
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="توضیحات کامل رویداد..."
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground resize-none"
              rows={3}
            />
          </div>

          {/* Location Picker */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              <MapPin className="h-4 w-4 inline ml-1" />
              موقعیت مکانی *
            </label>
            <SimpleMapPicker
              latitude={formData.latitude}
              longitude={formData.longitude}
              address={formData.address}
              onLocationChange={(lat, lng) => {
                handleChange('latitude', lat.toString());
                handleChange('longitude', lng.toString());
              }}
              onAddressChange={(address) => handleChange('address', address)}
            />
          </div>

          {/* Start DateTime */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              <Calendar className="h-4 w-4 inline ml-1" />
              زمان شروع رویداد *
            </label>
            <Input
              type="datetime-local"
              value={formData.startDateTime}
              onChange={(e) => handleChange('startDateTime', e.target.value)}
              min={minDateTime}
              required
            />
          </div>

          {/* Registration End */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              <Clock className="h-4 w-4 inline ml-1" />
              پایان ثبت نام *
            </label>
            <Input
              type="datetime-local"
              value={formData.registrationEnd}
              onChange={(e) => handleChange('registrationEnd', e.target.value)}
              min={minDateTime}
              max={maxRegEndDateTime}
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              ثبت نام باید قبل از شروع رویداد بسته شود
            </p>
          </div>

          {/* Max Participants */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              <Users className="h-4 w-4 inline ml-1" />
              حداکثر شرکت کنندگان
            </label>
            <Input
              type="number"
              min="1"
              value={formData.maxParticipants}
              onChange={(e) => handleChange('maxParticipants', e.target.value)}
              placeholder="بدون محدودیت"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              <DollarSign className="h-4 w-4 inline ml-1" />
              هزینه شرکت (تومان)
            </label>
            <Input
              type="number"
              min="0"
              step="1000"
              value={formData.price}
              onChange={(e) => handleChange('price', e.target.value)}
              placeholder="0"
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              انصراف
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={loading}
            >
              {loading ? 'در حال ایجاد...' : 'ایجاد رویداد'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
