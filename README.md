# دوندگان شهر - سامانه مدیریت رویدادهای دویدن

یک PWA مدرن برای مدیریت و ثبت نام در رویدادهای دویدن شهری با پشتیبانی کامل از زبان فارسی و RTL.

## ویژگی‌های کلیدی

- 🏃‍♂️ **مدیریت رویدادهای دویدن**: ایجاد، ویرایش و مدیریت رویدادها
- 📱 **PWA**: قابلیت نصب روی موبایل و دسکتاپ
- 🔐 **احراز هویت OTP**: ورود امن با کد تایید پیامکی
- 🗺️ **نقشه تعاملی**: نمایش موقعیت رویدادها روی نقشه
- ⏰ **ثبت نام زمان‌دار**: محدودیت زمانی برای ثبت نام
- 💳 **پرداخت آنلاین**: پشتیبانی از درگاه‌های پرداخت
- 🌙 **حالت تاریک**: پشتیبانی از تم روشن و تاریک
- 🇮🇷 **فارسی و RTL**: طراحی کامل برای زبان فارسی

## تکنولوژی‌های استفاده شده

- **Frontend**: Next.js 15, React 19
- **UI Components**: shadcn/ui, Radix UI
- **Styling**: Tailwind CSS
- **Database**: Prisma ORM + SQLite
- **Authentication**: NextAuth.js
- **Maps**: React Leaflet
- **PWA**: next-pwa
- **SMS**: Twilio
- **Forms**: React Hook Form + Zod

## نصب و راه‌اندازی

### پیش‌نیازها

- Node.js 18+ 
- npm یا yarn

### مراحل نصب

1. **کلون کردن پروژه**
   ```bash
   git clone <repository-url>
   cd sh_runners
   ```

2. **نصب وابستگی‌ها**
   ```bash
   npm install
   ```

3. **تنظیم متغیرهای محیطی**
   
   فایل `.env.local` را ایجاد کنید:
   ```env
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_SECRET="your-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"
   TWILIO_ACCOUNT_SID="your-twilio-sid"
   TWILIO_AUTH_TOKEN="your-twilio-token"
   TWILIO_PHONE_NUMBER="your-twilio-phone"
   ```

4. **راه‌اندازی دیتابیس**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **اجرای پروژه**
   ```bash
   npm run dev
   ```

6. **مشاهده در مرورگر**
   
   [http://localhost:3000](http://localhost:3000) را باز کنید

## ساختار پروژه

```
src/
├── app/                 # App Router (Next.js 13+)
│   ├── layout.js       # Layout اصلی
│   ├── page.js         # صفحه اصلی
│   └── globals.css     # استایل‌های سراسری
├── components/         # کامپوننت‌های React
│   ├── ui/            # کامپوننت‌های shadcn/ui
│   └── AuthModal.js   # مودال احراز هویت
├── lib/               # توابع کمکی
│   └── utils.js       # ابزارهای عمومی
└── types/             # تعریف انواع TypeScript

prisma/
└── schema.prisma      # اسکیمای دیتابیس

public/
├── manifest.json      # تنظیمات PWA
└── icons/            # آیکون‌های PWA
```

## API Routes

- `POST /api/auth/send-otp` - ارسال کد تایید
- `POST /api/auth/verify-otp` - تایید کد
- `GET /api/events` - دریافت لیست رویدادها
- `POST /api/events` - ایجاد رویداد جدید
- `POST /api/events/[id]/register` - ثبت نام در رویداد

## مشارکت در پروژه

1. Fork کنید
2. برنچ جدید بسازید (`git checkout -b feature/amazing-feature`)
3. تغییرات را commit کنید (`git commit -m 'Add amazing feature'`)
4. Push کنید (`git push origin feature/amazing-feature`)
5. Pull Request ایجاد کنید

## مجوز

این پروژه تحت مجوز MIT منتشر شده است.

## پشتیبانی

برای گزارش باگ یا درخواست ویژگی جدید، لطفاً issue ایجاد کنید.
