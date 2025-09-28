const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const mockEvents = [
  {
    title: 'دوی صبحگاهی پارک لاله',
    description: 'دوی گروهی صبحگاهی در پارک لاله. مسافت 5 کیلومتر با سرعت متوسط. مناسب برای تمام سطوح.',
    address: 'پارک لاله، خیابان کریمخان زند، تهران',
    latitude: 35.6961,
    longitude: 51.4231,
    startDateTime: new Date('2025-01-15T06:30:00'),
    endDateTime: new Date('2025-01-15T06:30:00'),
    registrationEnd: new Date('2025-01-14T23:59:00'),
    maxParticipants: 50,
    price: 0,
    isActive: true
  },
  {
    title: 'مسابقه دو 10 کیلومتری میدان آزادی',
    description: 'مسابقه رسمی دو 10 کیلومتری با اهدای مدال و جوایز نقدی. ثبت نام محدود.',
    address: 'میدان آزادی، تهران',
    latitude: 35.7219,
    longitude: 51.3347,
    startDateTime: new Date('2025-01-20T07:00:00'),
    endDateTime: new Date('2025-01-20T07:00:00'),
    registrationEnd: new Date('2025-01-18T20:00:00'),
    maxParticipants: 200,
    price: 150000,
    isActive: true
  },
  {
    title: 'دوی خانوادگی پارک ملت',
    description: 'دوی تفریحی برای خانواده‌ها. مسافت 3 کیلومتر. کودکان زیر 12 سال رایگان.',
    address: 'پارک ملت، خیابان ولیعصر، تهران',
    latitude: 35.7308,
    longitude: 51.4214,
    startDateTime: new Date('2025-01-25T08:00:00'),
    endDateTime: new Date('2025-01-25T08:00:00'),
    registrationEnd: new Date('2025-01-24T18:00:00'),
    maxParticipants: 100,
    price: 50000,
    isActive: true
  },
  {
    title: 'نایت ران - دوی شبانه',
    description: 'دوی شبانه در مسیر خیابان ولیعصر. 7 کیلومتر با نورپردازی و موزیک.',
    address: 'میدان تجریش، خیابان ولیعصر، تهران',
    latitude: 35.8042,
    longitude: 51.4336,
    startDateTime: new Date('2025-02-01T20:00:00'),
    endDateTime: new Date('2025-02-01T20:00:00'),
    registrationEnd: new Date('2025-01-30T23:59:00'),
    maxParticipants: 80,
    price: 100000,
    isActive: true
  },
  {
    title: 'چالش دوی کوهستان',
    description: 'دوی چالشی در کوه‌های اطراف تهران. 15 کیلومتر با شیب. فقط برای دوندگان حرفه‌ای.',
    address: 'دربند، شمال تهران',
    latitude: 35.8270,
    longitude: 51.4280,
    startDateTime: new Date('2025-02-05T06:00:00'),
    endDateTime: new Date('2025-02-05T06:00:00'),
    registrationEnd: new Date('2025-02-03T20:00:00'),
    maxParticipants: 30,
    price: 200000,
    isActive: true
  },
  {
    title: 'دوی خیریه برای کودکان',
    description: 'دوی خیریه 5 کیلومتری. تمام درآمد به کودکان نیازمند اهدا می‌شود.',
    address: 'پارک شهر، منطقه 3، تهران',
    latitude: 35.7197,
    longitude: 51.4053,
    startDateTime: new Date('2025-02-10T07:30:00'),
    endDateTime: new Date('2025-02-10T07:30:00'),
    registrationEnd: new Date('2025-02-08T23:59:00'),
    maxParticipants: 150,
    price: 75000,
    isActive: true
  }
];

async function seedEvents() {
  try {
    console.log('🌱 شروع ایجاد رویدادهای نمونه...');

    // Clear existing events (optional)
    // await prisma.event.deleteMany({});
    // console.log('🗑️ رویدادهای قبلی حذف شدند');

    // Create mock events
    for (const eventData of mockEvents) {
      const event = await prisma.event.create({
        data: eventData
      });
      console.log(`✅ رویداد ایجاد شد: ${event.title}`);
    }

    console.log(`🎉 ${mockEvents.length} رویداد نمونه با موفقیت ایجاد شد!`);
    
    // Show summary
    const totalEvents = await prisma.event.count();
    console.log(`📊 مجموع رویدادها در دیتابیس: ${totalEvents}`);

  } catch (error) {
    console.error('❌ خطا در ایجاد رویدادهای نمونه:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  seedEvents();
}

module.exports = { seedEvents, mockEvents };
