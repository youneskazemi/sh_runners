const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function quickSeed() {
  try {
    console.log('🚀 ایجاد سریع رویدادهای تست...');

    // Create 3 quick test events
    const events = [
      {
        title: 'دوی صبحگاهی پارک لاله',
        description: 'دوی گروهی 5 کیلومتری در پارک لاله',
        address: 'پارک لاله، تهران',
        latitude: 35.6961,
        longitude: 51.4231,
        startDateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        endDateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        registrationEnd: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        maxParticipants: 50,
        price: 0,
        isActive: true
      },
      {
        title: 'مسابقه دو میدان آزادی',
        description: 'مسابقه 10 کیلومتری با جوایز',
        address: 'میدان آزادی، تهران',
        latitude: 35.7219,
        longitude: 51.3347,
        startDateTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        endDateTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        registrationEnd: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        maxParticipants: 100,
        price: 150000,
        isActive: true
      },
      {
        title: 'دوی خانوادگی پارک ملت',
        description: 'دوی تفریحی 3 کیلومتری برای خانواده',
        address: 'پارک ملت، تهران',
        latitude: 35.7308,
        longitude: 51.4214,
        startDateTime: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
        endDateTime: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        registrationEnd: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000), // 18 days from now
        maxParticipants: 75,
        price: 50000,
        isActive: true
      }
    ];

    for (const eventData of events) {
      const event = await prisma.event.create({
        data: eventData
      });
      console.log(`✅ ${event.title}`);
    }

    console.log('🎉 رویدادهای تست ایجاد شدند!');

  } catch (error) {
    console.error('❌ خطا:', error);
  } finally {
    await prisma.$disconnect();
  }
}

quickSeed();
