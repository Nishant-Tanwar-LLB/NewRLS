"use client"; // 👈 This makes the buttons work

import { startBiddingAction } from "@/actions/bidding-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PlayCircle } from "lucide-react";
import { useState } from "react";

export default function BiddingLaunchForm({ orders }: { orders: any[] }) {
  const [duration, setDuration] = useState("");

  return (
    <Card className="border-brand-highlight shadow-md overflow-hidden">
      <CardHeader className="bg-brand-primary text-white p-4">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <PlayCircle className="h-5 w-5" /> Start New Auction
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form action={startBiddingAction} className="space-y-4">
          
          {/* 1. SELECT ORDER */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Select Order ID</label>
            <select name="orderId" className="w-full p-3 border rounded-lg bg-gray-50 text-sm font-medium focus:ring-2 focus:ring-brand-primary" required>
              <option value="">-- Choose Order --</option>
              {orders.map(order => (
                <option key={order.id} value={order.id}>
                  {order.orderNo} ({order.fromLocation} ➔ {order.toLocation})
                </option>
              ))}
            </select>
          </div>

          {/* 2. BASE PRICE */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Start Rate (₹)</label>
            <Input name="basePrice" type="number" placeholder="e.g. 40000" required />
            <p className="text-[10px] text-gray-400 mt-1">Drivers will bid *below* or *above* this.</p>
          </div>

          {/* 3. TIMER */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Duration (Minutes)</label>
            <div className="flex gap-2 mb-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setDuration("30")}>30m</Button>
              <Button type="button" variant="outline" className="flex-1" onClick={() => setDuration("60")}>1h</Button>
              <Button type="button" variant="outline" className="flex-1" onClick={() => setDuration("120")}>2h</Button>
            </div>
            <Input 
              name="duration" 
              type="number" 
              placeholder="Custom Min" 
              value={duration} 
              onChange={(e) => setDuration(e.target.value)} 
              required 
            />
          </div>

          <Button className="w-full bg-brand-primary hover:bg-brand-secondary font-bold text-white mt-2">
            Launch Auction 🚀
          </Button>

        </form>
      </CardContent>
    </Card>
  );
}