"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

// 1. GENERATE INVOICE (For Customer)
export async function generateInvoiceAction(formData: FormData) {
  const shipmentId = formData.get("shipmentId") as string;
  const amount = parseInt(formData.get("amount") as string);
  const invoiceNo = `INV-${Date.now().toString().slice(-6)}`;

  await prisma.invoice.create({
    data: {
      invoiceNo,
      amount,
      totalAmount: amount, 
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 
      shipmentId
    }
  });

  // FIXED: Using 'invoiceState'
  await prisma.shipment.update({
    where: { id: shipmentId },
    data: { invoiceState: "GENERATED" } 
  });

  revalidatePath("/dashboard/billing");
}

// 2. MARK CUSTOMER PAID
export async function markCustomerPaidAction(shipmentId: string) {
  await prisma.shipment.update({
    where: { id: shipmentId },
    data: { customerPaymentStatus: "RECEIVED" }
  });
  revalidatePath("/dashboard/billing");
}

// 3. MARK DRIVER PAID
export async function payDriverAction(shipmentId: string) {
  await prisma.shipment.update({
    where: { id: shipmentId },
    data: { driverPaymentStatus: "PAID" }
  });
  revalidatePath("/dashboard/billing");
}