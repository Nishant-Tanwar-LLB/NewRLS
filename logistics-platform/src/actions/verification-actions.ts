"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

// 1. VERIFY OWNER (The Main Account)
export async function verifyOwnerAction(ownerId: string, action: "APPROVE" | "REJECT") {
  const status = action === "APPROVE" ? "APPROVED" : "REJECTED";
  
  await prisma.truckOwner.update({
    where: { id: ownerId },
    data: { status }
  });

  revalidatePath("/dashboard/verification");
}

// 2. VERIFY TRUCK (Individual Vehicles)
export async function verifyTruckAction(truckId: string, action: "APPROVE" | "REJECT") {
  const status = action === "APPROVE" ? "APPROVED" : "REJECTED";
  
  await prisma.truck.update({
    where: { id: truckId },
    data: { status }
  });

  revalidatePath("/dashboard/verification");
}