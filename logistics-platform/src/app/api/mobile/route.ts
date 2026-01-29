import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, phone, otp, truckNumber, capacity, loadId, bidAmount } =
      body;

    // --- 0. SEND OTP ---
    if (action === "SEND_OTP") {
      console.log(`[MOBILE] Sending OTP to ${phone}`);
      return NextResponse.json({ success: true, message: "OTP Sent" });
    }

    // --- 1. LOGIN (VERIFY OTP) ---
    if (action === "VERIFY_OTP") {
      if (otp !== "1234")
        return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
      let owner = await prisma.truckOwner.findUnique({
        where: { phone },
        include: { trucks: true },
      });
      if (!owner)
        return NextResponse.json({
          success: true,
          user: { status: "NEW", fleet: [] },
        });
      return NextResponse.json({
        success: true,
        user: {
          name: owner.fullName,
          status: owner.status,
          fleet: owner.trucks,
        },
      });
    }

    // --- 2. REGISTER ---
    if (action === "REGISTER") {
      const newOwner = await prisma.truckOwner.create({
        data: { phone: phone, fullName: "New Partner", status: "PENDING" },
      });
      return NextResponse.json({ success: true, user: newOwner });
    }

    // --- 3. ADD TRUCK ---
    if (action === "ADD_TRUCK") {
      if (!phone)
        return NextResponse.json({ error: "Phone required" }, { status: 400 });
      const owner = await prisma.truckOwner.findUnique({ where: { phone } });
      if (!owner)
        return NextResponse.json({ error: "Owner not found" }, { status: 404 });
      const newTruck = await prisma.truck.create({
        data: {
          vehicleNumber: truckNumber,
          capacity: capacity + " Tons",
          truckType: "Open Body",
          status: "PENDING",
          ownerId: owner.id,
        },
      });
      return NextResponse.json({
        success: true,
        truck: {
          id: newTruck.id,
          number: newTruck.vehicleNumber,
          capacity: parseInt(newTruck.capacity),
          status: newTruck.status,
        },
      });
    }

    // --- 4. GET LOADS (FIXED: Nested Bids) ---
    if (action === "GET_LOADS") {
      // 1. Fetch Orders with Nested Bids
      const orders = await prisma.order.findMany({
        where: { status: "PENDING" },
        include: { 
          // Go through the BiddingSession to find bids
          biddingSession: {
            include: {
              bids: true
            }
          }
        }       
      });

      // 2. Calculate "Current Best Price"
      const formattedLoads = orders.map((o) => {
        // Access bids via biddingSession (handle case where session is null)
        const activeBids = o.biddingSession?.bids || [];

        // Find lowest bid amount
        const lowestBid = activeBids.length > 0 
          ? Math.min(...activeBids.map(b => b.amount)) 
          : o.rate; // Use base rate if no bids

        return {
          id: o.id,
          from: o.fromLocation,
          to: o.toLocation,
          price: "₹" + lowestBid, 
          weight: o.weight,
          type: o.material
        };
      });

      return NextResponse.json({ success: true, loads: formattedLoads });
    }

    // --- 5. PLACE BID ---
    if (action === "PLACE_BID") {
      const owner = await prisma.truckOwner.findUnique({ where: { phone } });
      if (!owner)
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      let session = await prisma.biddingSession.findUnique({
        where: { orderId: loadId },
      });
      if (!session) {
        session = await prisma.biddingSession.create({
          data: {
            orderId: loadId,
            endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
            basePrice: parseInt(bidAmount),
            status: "LIVE",
          },
        });
      }
      const newBid = await prisma.bid.create({
        data: {
          amount: parseInt(bidAmount),
          truckOwnerId: owner.id,
          biddingSessionId: session.id,
        },
      });
      return NextResponse.json({ success: true, bid: newBid });
    }

    // --- 6. CREATE ORDER ---
    if (action === "CREATE_ORDER") {
      const { from, to, price, weight, material } = body;
      const admin = await prisma.user.findFirst({
        where: { role: "SUPER_ADMIN" },
      });
      if (!admin)
        return NextResponse.json({ error: "No Admin found." }, { status: 400 });
      const newOrder = await prisma.order.create({
        data: {
          orderNo: `ORD-${Date.now()}`,
          customerName: "Admin Created",
          fromLocation: from,
          toLocation: to,
          material: material || "General Goods",
          weight: weight + " Tons",
          truckSize: "Open Body",
          rate: parseInt(price),
          status: "PENDING",
          createdById: admin.id,
          officeId: admin.officeId || "",
        },
      });
      return NextResponse.json({ success: true, order: newOrder });
    }

    // --- 7. GET PENDING TRUCKS ---
    if (action === "GET_PENDING_TRUCKS") {
      const trucks = await prisma.truck.findMany({
        where: { status: "PENDING" },
        include: { owner: true },
      });
      return NextResponse.json({ success: true, trucks });
    }

    // --- 8. APPROVE TRUCK ---
    if (action === "APPROVE_TRUCK") {
      const truck = await prisma.truck.update({
        where: { id: body.truckId },
        data: { status: "APPROVED" },
      });
      await prisma.truckOwner.update({
        where: { id: truck.ownerId },
        data: { status: "APPROVED" },
      });
      return NextResponse.json({ success: true });
    }

    // --- 9. GET ALL BIDS ---
    if (action === "GET_ALL_BIDS") {
      const bids = await prisma.bid.findMany({
        include: { truckOwner: true, load: true },
        orderBy: { amount: "asc" },
      });
      return NextResponse.json({ success: true, bids });
    }

    // --- 10. ACCEPT BID (Closes the Load) ---
    if (action === "ACCEPT_BID") {
      const { orderId, bidId } = body;

      // 1. Mark Order as ASSIGNED (Disappears from App)
      await prisma.order.update({
        where: { id: orderId },
        data: { status: "ASSIGNED" },
      });

      // 2. Mark Bid as ACCEPTED
      await prisma.bid.update({
        where: { id: bidId },
        data: { status: "ACCEPTED" },
      });

      return NextResponse.json({ success: true });
    }

    // ... inside POST function ...

    // --- 11. STOP BIDDING (Hide from App, move to History) ---
    if (action === "STOP_BIDDING") {
      const { orderId } = body;
      await prisma.order.update({
        where: { id: orderId },
        data: { status: "CANCELLED" } // Hides it from "GET_LOADS"
      });
      return NextResponse.json({ success: true });
    }

    // --- 12. GET HISTORY (See Cancelled/Completed Orders) ---
    if (action === "GET_HISTORY") {
      const history = await prisma.order.findMany({
        where: { 
          status: { not: "PENDING" } // Anything NOT live
        },
        include: { bids: true }, // Show past bids too
        orderBy: { updatedAt: 'desc' }
      });
      return NextResponse.json({ success: true, history });
    }

    // --- 13. REPOST ORDER (Bring back to Live) ---
    if (action === "REPOST_ORDER") {
      const { orderId } = body;
      
      // 1. Reset Order Status
      await prisma.order.update({
        where: { id: orderId },
        data: { status: "PENDING" }
      });

      // 2. Optional: We keep old bids so you can see history, 
      // or you could delete them here if you wanted a fresh start.
      
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
