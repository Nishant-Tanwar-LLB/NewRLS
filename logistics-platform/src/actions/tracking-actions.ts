"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function addTrackingUpdateAction(formData: FormData) {
  const session = await getServerSession(authOptions);
  const user = session?.user?.name || "System";

  const shipmentId = formData.get("shipmentId") as string;
  const status = formData.get("status") as string;
  const location = formData.get("location") as string;
  const remarks = formData.get("remarks") as string;

  // 1. Create the Log Entry
  await prisma.trackingUpdate.create({
    data: {
      shipmentId,
      status,
      location,
      remarks,
      createdBy: user
    }
  });

  // 2. (Optional) Update the main Shipment Status if it's "Delivered"
  if (status === "DELIVERED") {
    await prisma.shipment.update({
      where: { id: shipmentId },
      data: { status: "completed" }
    });
  }

  revalidatePath("/dashboard/tracking");
  revalidatePath("/dashboard/shipments");
}