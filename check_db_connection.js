const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function checkDatabaseConnection() {
  try {
    console.log("=== DATABASE CONNECTION CHECK ===\n");
    console.log("DATABASE_URL:", process.env.DATABASE_URL);
    console.log("\n=== FETCHING ALL CRIMES ===\n");

    // Get raw count
    const count = await prisma.crime.count();
    console.log(`Total crimes (count): ${count}`);

    // Get all crimes with all fields
    const crimes = await prisma.crime.findMany({
      orderBy: { createdAt: 'desc' }
    });

    console.log(`\nTotal crimes (findMany): ${crimes.length}\n`);

    if (crimes.length > 0) {
      console.log("=== ALL CRIMES (with full details) ===");
      crimes.forEach((crime, i) => {
        console.log(`\n${i + 1}. Crime ID: ${crime.id}`);
        console.log(`   Title: ${crime.title}`);
        console.log(`   Description: ${crime.description}`);
        console.log(`   Location: ${crime.location}`);
        console.log(`   Status: ${crime.status}`);
        console.log(`   User ID: ${crime.userId}`);
        console.log(`   Created At: ${crime.createdAt}`);
        console.log(`   Photo: ${crime.photo || 'None'}`);
      });

      // Check for crimes without userId
      const crimesWithoutUser = crimes.filter(c => !c.userId);
      if (crimesWithoutUser.length > 0) {
        console.log(`\n⚠️  WARNING: ${crimesWithoutUser.length} crimes have no userId!`);
        console.log("These crimes might not show up properly:");
        crimesWithoutUser.forEach(c => {
          console.log(`   - ${c.title} (ID: ${c.id})`);
        });
      }
    } else {
      console.log("❌ No crimes found in database!");
    }

    // Check users
    console.log("\n=== ALL USERS ===");
    const users = await prisma.user.findMany();
    console.log(`Total users: ${users.length}`);
    users.forEach((user, i) => {
      console.log(`${i + 1}. ${user.name} (${user.email}) - Role: ${user.role} - ID: ${user.id}`);
    });

  } catch (error) {
    console.error("❌ ERROR:", error);
    console.error("\nFull error details:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseConnection();
