"use server";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getVerifiedSuppliersAction() {
  // 1. Get Owners who are APPROVED
  const suppliers = await prisma.truckOwner.findMany({
    where: { 
        status: "APPROVED" 
    },
    include: {
      // 2. ONLY Get Trucks that are ALSO APPROVED
      trucks: {
        where: { status: "APPROVED" }
      }
    }
  });

  // Filter out suppliers who have 0 approved trucks (optional, but cleaner)
  return suppliers.filter(s => s.trucks.length > 0);
}