"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function createOrderAction(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return;

  const creator = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { office: true }
  });

  if (!creator) return;

  // --- STEP 1: GENERATE SMART ID (OFFICE-0001) ---
  
  // A. Determine Prefix (e.g., "DELHI" or "HQ")
  let prefix = "HQ";
  if (creator.office && creator.office.name) {
    // Take first 3-4 letters of office name (e.g. "MUMBAI" -> "MUM")
    prefix = creator.office.name.toUpperCase().substring(0, 3); 
  }

  // B. Find the LAST order created by this office
  const lastOrder = await prisma.order.findFirst({
    where: {
      orderNo: { startsWith: prefix } // Look for "MUM-..."
    },
    orderBy: { createdAt: "desc" } // Get the newest one
  });

  // C. Calculate Next Number
  let nextNumber = 1;
  if (lastOrder) {
    // Extract number from "MUM-0005" -> 5
    const parts = lastOrder.orderNo.split("-");
    const lastNum = parseInt(parts[1]); 
    if (!isNaN(lastNum)) {
      nextNumber = lastNum + 1;
    }
  }

  // D. Format: "MUM" + "0006" -> "MUM-0006"
  const orderNo = `${prefix}-${nextNumber.toString().padStart(4, "0")}`;

  // --- STEP 2: SAVE DATA ---
  const customerName = formData.get("customerName") as string;
  const fromLocation = formData.get("fromLocation") as string;
  const toLocation = formData.get("toLocation") as string;
  const material = formData.get("material") as string;
  const weight = formData.get("weight") as string;
  const truckSize = formData.get("truckSize") as string;
  const rate = parseInt(formData.get("rate") as string);

  await prisma.order.create({
    data: {
      orderNo,
      customerName,
      fromLocation,
      toLocation,
      material,
      weight,
      truckSize,
      rate,
      createdById: creator.id,
      officeId: creator.officeId, // Link to the office for data safety
      status: "PENDING",
    },
  });

  revalidatePath("/dashboard/orders");
}

// ... existing imports ...

export async function updateOrderAction(orderId: string, formData: FormData) {
  const customerName = formData.get("customerName") as string;
  const fromLocation = formData.get("fromLocation") as string;
  const toLocation = formData.get("toLocation") as string;
  const material = formData.get("material") as string;
  const weight = formData.get("weight") as string;
  const truckSize = formData.get("truckSize") as string;
  const rate = parseInt(formData.get("rate") as string);

  await prisma.order.update({
    where: { id: orderId },
    data: {
      customerName,
      fromLocation,
      toLocation,
      material,
      weight,
      truckSize,
      rate,
    },
  });

  revalidatePath("/dashboard/orders");
}