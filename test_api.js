const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "9f8d7a6b5c4e3d2f1a0b9c8d7e6f5g4h3j2k1l";

async function testAPI() {
  try {
    // Get admin user
    const admin = await prisma.user.findFirst({
      where: { email: "chan_admin@gmail.com" }
    });

    if (!admin) {
      console.log("❌ Admin user not found");
      return;
    }

    console.log("✓ Found admin user:", admin.name);
    console.log("  User ID:", admin.id);
    console.log("  Role:", admin.role);

    // Generate token (simulating login)
    const token = jwt.sign(
      { userId: admin.id, role: admin.role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    console.log("\n✓ Generated JWT token");

    // Decode token to verify
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("\n✓ Token decoded:");
    console.log("  userId:", decoded.userId);
    console.log("  role:", decoded.role);

    // Simulate the getCrimes controller logic
    console.log("\n=== Simulating getCrimes API call ===");
    
    let whereClause = {};
    if (decoded.role !== 'admin') {
      whereClause = { userId: decoded.userId };
      console.log("⚠ User is NOT admin - filtering by userId");
    } else {
      console.log("✓ User IS admin - showing all crimes");
    }

    const crimes = await prisma.crime.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });

    console.log(`\n✓ API would return ${crimes.length} crimes`);
    
    if (crimes.length > 0) {
      console.log("\nCrimes that would be returned:");
      crimes.forEach((crime, index) => {
        console.log(`  ${index + 1}. ${crime.title} (${crime.status})`);
      });
    } else {
      console.log("\n❌ No crimes would be returned!");
    }

  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testAPI();
