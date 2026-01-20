const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function seedCrimes() {
  try {
    // Get admin user
    const admin = await prisma.user.findFirst({
      where: { email: "chan_admin@gmail.com" }
    });

    if (!admin) {
      console.log("Admin user not found. Please run seed_admin.js first.");
      return;
    }

    console.log("Creating sample crime reports...");

    const crimes = [
      {
        title: "Theft at Downtown Mall",
        description: "Multiple items stolen from retail stores. Security footage shows suspect wearing black hoodie.",
        location: "Downtown Shopping Mall, Main Street",
        status: "Investigating",
        userId: admin.id
      },
      {
        title: "Vandalism in City Park",
        description: "Graffiti found on park benches and playground equipment. Occurred overnight.",
        location: "Central City Park, Park Avenue",
        status: "Pending",
        userId: admin.id
      },
      {
        title: "Vehicle Break-in",
        description: "Car window smashed, GPS device stolen. Incident occurred in parking lot.",
        location: "Office Complex Parking Lot, Business District",
        status: "Resolved",
        userId: admin.id
      },
      {
        title: "Suspicious Activity",
        description: "Unknown individuals loitering near residential area late at night.",
        location: "Elm Street Residential Area",
        status: "Investigating",
        userId: admin.id
      },
      {
        title: "Bicycle Theft",
        description: "Locked bicycle stolen from bike rack. Lock was cut.",
        location: "University Campus, Building A",
        status: "Pending",
        userId: admin.id
      }
    ];

    for (const crime of crimes) {
      await prisma.crime.create({
        data: crime
      });
      console.log(`✓ Created: ${crime.title}`);
    }

    console.log("\n✅ Successfully created 5 sample crime reports!");
    
    // Show summary
    const total = await prisma.crime.count();
    const pending = await prisma.crime.count({ where: { status: "Pending" } });
    const investigating = await prisma.crime.count({ where: { status: "Investigating" } });
    const resolved = await prisma.crime.count({ where: { status: "Resolved" } });

    console.log("\n📊 Database Summary:");
    console.log(`   Total Crimes: ${total}`);
    console.log(`   Pending: ${pending}`);
    console.log(`   Investigating: ${investigating}`);
    console.log(`   Resolved: ${resolved}`);

  } catch (error) {
    console.error("Error seeding crimes:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedCrimes();
