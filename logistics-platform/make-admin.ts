import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@logistics.com"; // The email you use to login
  const password = await bcrypt.hash("admin123", 10);

  // This will either CREATE the user or UPDATE them if they exist
  const user = await prisma.user.upsert({
    where: { email: email },
    update: {
      role: "SUPER_ADMIN", // <--- FORCE PROMOTION
      password: password,   // Reset password just in case
    },
    create: {
      email: email,
      name: "Super Boss",
      password: password,
      role: "SUPER_ADMIN",
    },
  });

  console.log("✅ SUCCESS!");
  console.log(`👤 User: ${user.email}`);
  console.log(`👑 New Role: ${user.role}`);
  console.log(`🔑 Password: admin123`);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());