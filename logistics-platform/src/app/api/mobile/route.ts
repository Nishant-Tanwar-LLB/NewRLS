import { NextResponse } from "next/server";

// --- MOCK DATABASE (Simulating Real Logic) ---
const MOCK_FLEET = [
  { id: 't1', number: 'HR-55-A-9090', capacity: 12, status: 'APPROVED' }, // Small Truck
  { id: 't2', number: 'DL-11-Z-5555', capacity: 20, status: 'APPROVED' }  // Big Truck (Only for Approved User)
];

const MOCK_LOADS = [
  { id: '1', from: 'Delhi, DEL', to: 'Mumbai, MAH', price: '₹45,000', weight: '18 Tons', type: 'Steel' },
  { id: '2', from: 'Jaipur, RAJ', to: 'Pune, MAH', price: '₹32,500', weight: '12 Tons', type: 'Textiles' },
  { id: '3', from: 'Gurgaon, HAR', to: 'Bangalore, KAR', price: '₹82,000', weight: '22 Tons', type: 'Electronics' },
];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, phone, otp, bidAmount, loadId } = body;

    // 1. LOGIN: SEND OTP
    if (action === "SEND_OTP") {
      console.log(`[MOBILE] Sending OTP to ${phone}`);
      return NextResponse.json({ success: true, message: "OTP Sent" });
    }

    // 2. LOGIN: VERIFY OTP (The Magic Logic)
    if (action === "VERIFY_OTP") {
      if (otp !== "1234") {
        return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
      }

      // SIMULATE DIFFERENT USERS BASED ON PHONE NUMBER
      let userStatus = "NEW"; 
      let fleet = [];

      if (phone.startsWith("90")) userStatus = "NEW";        // Test Registration
      if (phone.startsWith("80")) userStatus = "PENDING";    // Test Verification Banner
      if (phone.startsWith("70")) {
        userStatus = "APPROVED";   // Test Bidding
        fleet = MOCK_FLEET;        // Give them trucks
      }

      return NextResponse.json({ 
        success: true, 
        user: { name: "Truck Owner", status: userStatus, fleet: fleet } 
      });
    }

    // 3. REGISTER (KYC)
    if (action === "REGISTER") {
      return NextResponse.json({ success: true, status: "PENDING" });
    }

    // 4. GET LOADS
    if (action === "GET_LOADS") {
      return NextResponse.json({ success: true, loads: MOCK_LOADS });
    }

    // 5. PLACE BID
    if (action === "PLACE_BID") {
      console.log(`[BID] Bid of ₹${bidAmount} placed on Load ${loadId}`);
      return NextResponse.json({ success: true });
    }

    // 6. ADD TRUCK (The new logic)
    if (action === "ADD_TRUCK") {
      const { truckNumber, capacity } = body;
      console.log(`[FLEET] Adding truck ${truckNumber} (${capacity} Tons)`);
      
      // Simulating a DB insert
      const newTruck = { 
        id: Math.random().toString(), 
        number: truckNumber, 
        capacity: parseInt(capacity), 
        status: "PENDING" // Starts as pending!
      };
      
      return NextResponse.json({ success: true, truck: newTruck });
    }

    return NextResponse.json({ error: "Invalid Action" }, { status: 400 });

  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

// Allow GET requests too (for testing in browser)
export async function GET() {
  return NextResponse.json({ message: "Mobile API is Running 🚛" });
}