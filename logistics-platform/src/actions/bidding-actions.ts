"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function startBiddingAction(formData: FormData) {
  const orderId = formData.get("orderId") as string;
  const durationMinutes = parseInt(formData.get("duration") as string);
  const basePrice = parseInt(formData.get("basePrice") as string);

  if (!orderId || !durationMinutes) return { error: "Invalid Data" };

  // 1. Calculate End Time
  const startTime = new Date();
  const endTime = new Date(startTime.getTime() + durationMinutes * 60000); // Add minutes

  // 2. Create the Session
  await prisma.biddingSession.create({
    data: {
      orderId,
      startTime,
      endTime,
      basePrice,
      status: "LIVE"
    }
  });

  revalidatePath("/dashboard/bidding");
  return { success: true };
}

// Helper to Stop Bidding
export async function stopBiddingAction(sessionId: string) {
  await prisma.biddingSession.update({
    where: { id: sessionId },
    data: { status: "ENDED" }
  });
  revalidatePath("/dashboard/bidding");
}

// --- 3. REPOST AUCTION (Restart a stopped auction) ---
export async function repostAuctionAction(sessionId: string) {
  // Reset the auction to LIVE for another 30 minutes (default)
  // You can make this smarter later, but this gets it back on screen instantly.
  await prisma.biddingSession.update({
    where: { id: sessionId },
    data: { 
      status: "LIVE",
      startTime: new Date(),
      endTime: new Date(Date.now() + 30 * 60000) // +30 mins
    }
  });

  revalidatePath("/dashboard/bidding");
}