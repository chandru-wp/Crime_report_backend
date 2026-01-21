const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  const email = "new_admin@gmail.com";
  const rawPassword = "admin123";
  const hashedPassword = await bcrypt.hash(rawPassword, 10);
  
  const user = await prisma.user.upsert({
    where: { email },
    update: { password: hashedPassword, role: "admin" },
    create: {
      email,
      name: "New Admin User",
      password: hashedPassword,
      role: "admin",
    },
  });
  
  console.log("New Admin user created successfully!");
  console.log("Email:", email);
  console.log("Password:", rawPassword);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
