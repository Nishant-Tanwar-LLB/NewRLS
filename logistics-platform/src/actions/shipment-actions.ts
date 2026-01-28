"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function createShipmentAction(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { error: "Not authorized" };

  const creator = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { office: true }
  });

  if (!creator) return { error: "User not found" };

  // 1. GENERATE UNIQUE ID (RLS + 6 Random Digits)
  // Logic: RLS + Random Number between 100000 and 999999
  const randomId = Math.floor(100000 + Math.random() * 900000);
  const shipmentId = `RLS${randomId}`;

  // 2. EXTRACT FORM DATA
  const orderId = formData.get("orderId") as string;
  const truckOwnerId = formData.get("truckOwnerId") as string;
  const truckId = formData.get("truckId") as string;
  const driverName = formData.get("driverName") as string;
  const driverPhone = formData.get("driverPhone") as string;
  const supplierRate = parseInt(formData.get("supplierRate") as string);
  const customerRate = parseInt(formData.get("customerRate") as string);

  // 3. CREATE SHIPMENT
  await prisma.shipment.create({
    data: {
      shipmentId,
      orderId,
      truckOwnerId,
      truckId,
      driverName,
      driverPhone,
      supplierRate,
      customerRate,
      createdById: creator.id,
      officeId: creator.officeId, // Linked to Creator's Office
      status: "booked",
    },
  });

  // 4. UPDATE ORDER STATUS
  await prisma.order.update({
    where: { id: orderId },
    data: { status: "ASSIGNED" }
  });

  revalidatePath("/dashboard/orders");
  revalidatePath("/dashboard/shipments");
  return { success: true };
}