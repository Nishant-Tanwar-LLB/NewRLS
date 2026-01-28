const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('admin123', 10); // Default password

  await prisma.user.upsert({
    where: { email: 'admin@logistics.com' },
    update: {},
    create: {
      email: 'admin@logistics.com',
      name: 'Super Admin',
      password: password,
      role: 'SUPER_ADMIN',
    },
  });

  console.log("✅ Super Admin created!");
  console.log("📧 Email: admin@logistics.com");
  console.log("🔑 Pass: admin123");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());