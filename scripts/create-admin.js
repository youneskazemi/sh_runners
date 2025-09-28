const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('🔍 Looking for users...');
    
    // Get the first user or a specific phone number
    const adminPhone = process.argv[2]; // Pass phone number as argument
    
    let user;
    if (adminPhone) {
      // Find user by phone number
      user = await prisma.user.findUnique({
        where: { phone: adminPhone }
      });
      
      if (!user) {
        console.log(`❌ User with phone ${adminPhone} not found`);
        console.log('💡 Please register this phone number first, then run the script again');
        return;
      }
    } else {
      // Get the first user
      user = await prisma.user.findFirst({
        orderBy: { createdAt: 'asc' }
      });
      
      if (!user) {
        console.log('❌ No users found in database');
        console.log('💡 Please register a user first, then run this script');
        return;
      }
    }

    // Make user admin
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { isAdmin: true }
    });

    console.log('✅ Admin created successfully!');
    console.log(`👤 Admin: ${updatedUser.firstName} ${updatedUser.lastName}`);
    console.log(`📱 Phone: ${updatedUser.phone}`);
    console.log(`🔑 Admin Status: ${updatedUser.isAdmin}`);
    
  } catch (error) {
    console.error('❌ Error creating admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
