import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 1. Force update the existing user
  const user = await prisma.user.update({
    where: { email: "admin@logistics.com" }, // Find this exact email
    data: {
      role: "SUPER_ADMIN", // Change role to BOSS
    },
  });

  console.log("✅ SUCCESS! User updated.");
  console.log(`👤 Name: ${user.name}`);
  console.log(`👑 New Role: ${user.role}`);
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
  })
  .finally(async () => await prisma.$disconnect());