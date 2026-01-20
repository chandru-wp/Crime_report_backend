const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function debugCrimes() {
  try {
    console.log("=== Checking All Crimes ===");
    const crimes = await prisma.crime.findMany({
      include: {
        user: {
          select: { name: true, email: true, role: true }
        }
      }
    });
    
    console.log(`Total crimes in database: ${crimes.length}`);
    crimes.forEach((crime, index) => {
      console.log(`\n${index + 1}. ${crime.title}`);
      console.log(`   Status: ${crime.status}`);
      console.log(`   Location: ${crime.location}`);
      console.log(`   Created by: ${crime.user?.name} (${crime.user?.email}) - Role: ${crime.user?.role}`);
      console.log(`   Created at: ${crime.createdAt}`);
    });

    console.log("\n=== Checking Admin Users ===");
    const admins = await prisma.user.findMany({
      where: { role: "admin" }
    });
    
    console.log(`Total admin users: ${admins.length}`);
    admins.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.name} (${admin.email})`);
    });

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

debugCrimes();
