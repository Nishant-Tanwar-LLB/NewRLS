const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const zones = ["North Zone", "South Zone", "East Zone", "West Zone"];

  for (const zone of zones) {
    await prisma.zone.create({
      data: { name: zone }
    });
  }
  console.log("✅ Zones Created!");
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());