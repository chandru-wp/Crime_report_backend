const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function findRealCrimes() {
  try {
    console.log("=== SEARCHING FOR REAL USER-CREATED CRIMES ===\n");

    // Get all crimes
    const allCrimes = await prisma.crime.findMany({
      include: {
        user: {
          select: { name: true, email: true, role: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`Total crimes in database: ${allCrimes.length}\n`);

    // Separate crimes by user role
    const crimesByAdmins = allCrimes.filter(c => c.user?.role === 'admin');
    const crimesByUsers = allCrimes.filter(c => c.user?.role === 'user');

    console.log("📊 Crimes created by ADMIN users (likely seeded/test data):");
    console.log(`   Count: ${crimesByAdmins.length}`);
    crimesByAdmins.forEach((crime, i) => {
      console.log(`   ${i + 1}. ${crime.title} - by ${crime.user?.name} (${crime.user?.email})`);
    });

    console.log("\n📊 Crimes created by REGULAR users (real user data):");
    console.log(`   Count: ${crimesByUsers.length}`);
    if (crimesByUsers.length === 0) {
      console.log("   ❌ No crimes created by regular users yet!");
    } else {
      crimesByUsers.forEach((crime, i) => {
        console.log(`   ${i + 1}. ${crime.title} - by ${crime.user?.name} (${crime.user?.email})`);
        console.log(`      Status: ${crime.status}, Location: ${crime.location}`);
        console.log(`      Created: ${crime.createdAt}`);
      });
    }

    // Check if we want to delete seeded data
    console.log("\n=== RECOMMENDATION ===");
    if (crimesByAdmins.length > 0 && crimesByUsers.length === 0) {
      console.log("⚠️  All crimes were created by admin users (likely test/seed data).");
      console.log("💡 If you want to remove the seeded data, run: node delete_seed_crimes.js");
    } else if (crimesByUsers.length > 0) {
      console.log("✓ You have real user-created crimes in the database!");
      console.log("✓ The system is showing ALL crimes (both admin and user created) to admins.");
    }

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

findRealCrimes();
