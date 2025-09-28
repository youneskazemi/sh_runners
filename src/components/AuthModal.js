'use client';

import { useState } from 'react';
import { Phone, User, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { formatPhoneNumber } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function AuthModal({ open, onClose }) {
  const [step, setStep] = useState('phone'); // 'phone', 'otp', 'profile'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    const cleanPhone = phoneNumber.replace(/\s/g, '');
    
    if (!cleanPhone || !cleanPhone.match(/^09\d{9}$/)) {
      toast.error('لطفا شماره تلفن معتبر وارد کنید (09xxxxxxxxx)');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone: cleanPhone }),
      });

      const data = await response.json();

      if (data.success) {
        setStep('otp');
        toast.success('کد تایید ارسال شد');
        // In development, show the OTP code
        if (data.devOtp) {
          console.log('Development OTP:', data.devOtp);
          toast(`کد تایید: ${data.devOtp}`, {
            duration: 8000,
            icon: '🔐',
            style: {
              background: '#2563EB', // Primary blue
              color: '#FFFFFF',
              border: '1px solid #1D4ED8',
            },
          });
        }
      } else {
        toast.error(data.error || 'خطا در ارسال کد تایید');
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      toast.error('خطا در ارسال کد تایید');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 4) {
      toast.error('لطفا کد تایید را وارد کنید');
      return;
    }

    setLoading(true);
    try {
      const cleanPhone = phoneNumber.replace(/\s/g, '');
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phone: cleanPhone, 
          otp: otp.trim()
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (data.requiresProfile) {
          setStep('profile');
          toast('لطفا اطلاعات خود را تکمیل کنید', {
            icon: '👤',
          });
        } else {
          // User already exists, login successful
          toast.success('ورود موفقیت‌آمیز!');
          window.location.reload(); // Refresh to update auth state
          onClose();
        }
      } else {
        toast.error(data.error || 'کد تایید نادرست است');
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      toast.error('خطا در تایید کد');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!firstName || !lastName) {
      toast.error('لطفا نام و نام خانوادگی خود را وارد کنید');
      return;
    }

    setLoading(true);
    try {
      const cleanPhone = phoneNumber.replace(/\s/g, '');
      const response = await fetch('/api/auth/complete-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phone: cleanPhone, 
          otp: otp.trim(),
          firstName: firstName.trim(),
          lastName: lastName.trim()
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('ثبت نام با موفقیت انجام شد!', {
          icon: '🎉',
        });
        window.location.reload(); // Refresh to update auth state
        onClose();
      } else {
        toast.error(data.error || 'خطا در ثبت نام');
      }
    } catch (error) {
      console.error('Complete profile error:', error);
      toast.error('خطا در ثبت نام');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="bg-primary/10 p-3 rounded-full w-fit mx-auto mb-4">
            {step === 'phone' && <Phone className="h-8 w-8 text-primary" />}
            {step === 'otp' && <Check className="h-8 w-8 text-primary" />}
            {step === 'profile' && <User className="h-8 w-8 text-primary" />}
          </div>
          <DialogTitle className="text-2xl">
            {step === 'phone' && 'ورود / ثبت نام'}
            {step === 'otp' && 'تایید شماره تلفن'}
            {step === 'profile' && 'تکمیل اطلاعات'}
          </DialogTitle>
          <DialogDescription>
            {step === 'phone' && 'شماره تلفن خود را وارد کنید'}
            {step === 'otp' && `کد تایید به شماره ${phoneNumber} ارسال شد`}
            {step === 'profile' && 'نام و نام خانوادگی خود را وارد کنید'}
          </DialogDescription>
        </DialogHeader>

        {step === 'phone' && (
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                شماره تلفن همراه
              </label>
              <Input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
                placeholder="09XX XXX XXXX"
                className="text-center ltr"
                maxLength={13}
                required
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2 space-x-reverse">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>در حال ارسال...</span>
                </div>
              ) : (
                'ارسال کد تایید'
              )}
            </Button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                کد تایید
              </label>
              <Input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="کد ۴ تا ۶ رقمی"
                className="text-center ltr text-2xl tracking-widest"
                maxLength={6}
                required
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2 space-x-reverse">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>در حال تایید...</span>
                </div>
              ) : (
                'تایید کد'
              )}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setStep('phone')}
              className="w-full"
            >
              بازگشت
            </Button>
          </form>
        )}

        {step === 'profile' && (
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                نام
              </label>
              <Input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="نام خود را وارد کنید"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                نام خانوادگی
              </label>
              <Input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="نام خانوادگی خود را وارد کنید"
                required
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2 space-x-reverse">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>در حال ثبت نام...</span>
                </div>
              ) : (
                'تکمیل ثبت نام'
              )}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setStep('otp')}
              className="w-full"
            >
              بازگشت
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
