"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

// 1. GENERATE INVOICE (For Customer)
export async function generateInvoiceAction(formData: FormData) {
  const shipmentId = formData.get("shipmentId") as string;
  const amount = parseInt(formData.get("amount") as string);
  const invoiceNo = `INV-${Date.now().toString().slice(-6)}`; // Simple Auto ID

  // Create Invoice
  await prisma.invoice.create({
    data: {
      invoiceNo,
      amount,
      totalAmount: amount, // You can add tax logic here later
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 Days
      shipmentId
    }
  });

  // Update Shipment Status
  await prisma.shipment.update({
    where: { id: shipmentId },
    data: { invoiceStatus: "GENERATED" }
  });

  revalidatePath("/dashboard/billing");
}

// 2. MARK CUSTOMER PAID (Money Received)
export async function markCustomerPaidAction(shipmentId: string) {
  await prisma.shipment.update({
    where: { id: shipmentId },
    data: { customerPaymentStatus: "RECEIVED" }
  });
  revalidatePath("/dashboard/billing");
}

// 3. MARK DRIVER PAID (Money Sent)
export async function payDriverAction(shipmentId: string) {
  await prisma.shipment.update({
    where: { id: shipmentId },
    data: { driverPaymentStatus: "PAID" }
  });
  revalidatePath("/dashboard/billing");
}