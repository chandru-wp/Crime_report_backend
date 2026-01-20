const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function checkAllData() {
  try {
    console.log("=== COMPLETE DATABASE AUDIT ===\n");

    // Check all users
    const allUsers = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    });
    console.log(`📊 Total Users: ${allUsers.length}`);
    allUsers.forEach((user, i) => {
      console.log(`  ${i + 1}. ${user.name} (${user.email}) - Role: ${user.role}`);
    });

    // Check all crimes
    console.log(`\n📊 Total Crimes: ${await prisma.crime.count()}`);
    const allCrimes = await prisma.crime.findMany({
      include: {
        user: {
          select: { name: true, email: true, role: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log("\n=== ALL CRIMES IN DATABASE ===");
    if (allCrimes.length === 0) {
      console.log("❌ No crimes found in database!");
    } else {
      allCrimes.forEach((crime, i) => {
        console.log(`\n${i + 1}. ${crime.title}`);
        console.log(`   ID: ${crime.id}`);
        console.log(`   Status: ${crime.status}`);
        console.log(`   Location: ${crime.location}`);
        console.log(`   Description: ${crime.description.substring(0, 60)}...`);
        console.log(`   Reported by: ${crime.user?.name} (${crime.user?.email}) - Role: ${crime.user?.role}`);
        console.log(`   User ID: ${crime.userId}`);
        console.log(`   Created: ${crime.createdAt}`);
      });
    }

    // Check what admin would see
    console.log("\n=== WHAT ADMIN SEES (userRole === 'admin') ===");
    const adminCrimes = await prisma.crime.findMany({
      where: {}, // Empty where clause = all crimes
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });
    console.log(`Admin would see: ${adminCrimes.length} crimes`);

    // Check what regular user would see
    const regularUser = allUsers.find(u => u.role === 'user');
    if (regularUser) {
      console.log(`\n=== WHAT USER '${regularUser.name}' SEES (userRole === 'user') ===`);
      const userCrimes = await prisma.crime.findMany({
        where: { userId: regularUser.id },
        orderBy: { createdAt: 'desc' }
      });
      console.log(`User would see: ${userCrimes.length} crimes (only their own)`);
    }

    console.log("\n=== SUMMARY ===");
    console.log(`✓ Total users in DB: ${allUsers.length}`);
    console.log(`✓ Total crimes in DB: ${allCrimes.length}`);
    console.log(`✓ Admin sees: ${adminCrimes.length} crimes (should be ALL crimes)`);
    console.log(`✓ Database connection: Working`);

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllData();
