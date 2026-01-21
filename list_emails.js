const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.user.findMany({ select: { email: true, name: true } });
  console.log("Found Users:");
  users.forEach(u => console.log(`- ${u.email} (${u.name})`));
}
main().catch(console.error).finally(() => prisma.$disconnect());
