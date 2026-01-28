import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const commonPassword = await bcrypt.hash("admin123", 10);

  const heads = [
    {
      name: "Amit Operations",
      email: "head.ops@logistics.com",
      role: "DEPT_HEAD",
      department: "OPERATIONS",
    },
    {
      name: "Priya HR",
      email: "head.hr@logistics.com",
      role: "DEPT_HEAD",
      department: "HR",
    },
    {
      name: "Rahul IT",
      email: "head.it@logistics.com",
      role: "DEPT_HEAD",
      department: "IT",
    },
    {
      name: "Suresh Accounts",
      email: "head.accounts@logistics.com",
      role: "DEPT_HEAD",
      department: "ACCOUNTS",
    },
    {
      name: "Vikram HelpDesk",
      email: "head.support@logistics.com",
      role: "DEPT_HEAD",
      department: "PARTNER_HELP_DESK",
    },
  ];

  console.log("🚀 Starting Corporate Setup...");

  for (const boss of heads) {
    const user = await prisma.user.upsert({
      where: { email: boss.email },
      update: {}, // If exists, do nothing
      create: {
        email: boss.email,
        name: boss.name,
        password: commonPassword,
        role: boss.role as any,
        department: boss.department as any,
        officeId: null, // Heads are usually at HQ (No specific branch)
      },
    });
    console.log(`✅ Created: ${boss.name} (${boss.department})`);
  }

  console.log("\n🎉 All Department Heads are ready!");
  console.log("👉 Login Password for all: admin123");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());