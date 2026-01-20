const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  const email = "chan_admin@gmail.com";
  const hashedPassword = await bcrypt.hash("chan123", 10);
  
  const user = await prisma.user.upsert({
    where: { email },
    update: { password: hashedPassword },
    create: {
      email,
      name: "Chandru Admin",
      password: hashedPassword,
      role: "admin",
    },
  });
  
  console.log("Admin user created/updated:", user.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
