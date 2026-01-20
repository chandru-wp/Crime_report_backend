const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function deleteSeedCrimes() {
  try {
    console.log("=== DELETING SEEDED TEST CRIMES ===\n");

    // List of seeded crime titles to delete
    const seedTitles = [
      "Theft at Downtown Mall",
      "Vandalism in City Park",
      "Vehicle Break-in",
      "Suspicious Activity",
      "Bicycle Theft"
    ];

    console.log("Looking for these seeded crimes:");
    seedTitles.forEach((title, i) => {
      console.log(`  ${i + 1}. ${title}`);
    });

    // Find crimes with these titles
    const crimesToDelete = await prisma.crime.findMany({
      where: {
        title: {
          in: seedTitles
        }
      }
    });

    console.log(`\nFound ${crimesToDelete.length} seeded crimes to delete\n`);

    if (crimesToDelete.length === 0) {
      console.log("✓ No seeded crimes found. Database is already clean!");
      return;
    }

    // Delete them
    const result = await prisma.crime.deleteMany({
      where: {
        title: {
          in: seedTitles
        }
      }
    });

    console.log(`✅ Successfully deleted ${result.count} seeded crimes!\n`);

    // Check remaining crimes
    const remainingCrimes = await prisma.crime.findMany({
      include: {
        user: {
          select: { name: true, email: true, role: true }
        }
      }
    });

    console.log("=== REMAINING CRIMES IN DATABASE ===");
    if (remainingCrimes.length === 0) {
      console.log("✓ Database is now empty. Ready for real user data!");
    } else {
      console.log(`Total remaining crimes: ${remainingCrimes.length}\n`);
      remainingCrimes.forEach((crime, i) => {
        console.log(`${i + 1}. ${crime.title}`);
        console.log(`   Status: ${crime.status}`);
        console.log(`   Created by: ${crime.user?.name} (${crime.user?.role})`);
        console.log(`   Created at: ${crime.createdAt}\n`);
      });
    }

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteSeedCrimes();
