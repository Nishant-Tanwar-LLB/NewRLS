import { PrismaClient } from "@prisma/client";
import { stopBiddingAction } from "@/actions/bidding-actions";
import BiddingLaunchForm from "@/components/bidding/BiddingLaunchForm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Timer, Gavel, StopCircle, ArrowRight, RefreshCcw } from "lucide-react";

const prisma = new PrismaClient();

export default async function BiddingPage() {
  // 1. Get Orders that are PENDING (Available for bidding)
  const availableOrders = await prisma.order.findMany({
    where: { 
      status: "PENDING",
      biddingSession: { is: null } 
    },
    orderBy: { createdAt: "desc" }
  });

  // 2. Get LIVE Bidding Sessions
  const liveSessions = await prisma.biddingSession.findMany({
    where: { status: "LIVE" },
    include: { 
      order: true,
      _count: { select: { bids: true } }
    }
  });

  // 3. NEW: Get ENDED/STOPPED Sessions (History)
  const historySessions = await prisma.biddingSession.findMany({
    where: { status: "ENDED" },
    include: { 
      order: true,
      _count: { select: { bids: true } }
    },
    orderBy: { endTime: "desc" }
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-brand-highlight flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
             <Gavel className="text-brand-primary h-7 w-7" />
             Live Bidding Console
           </h1>
           <p className="text-xs text-gray-500 font-medium ml-9">Start auctions and monitor bids.</p>
        </div>
        <Badge className="bg-red-100 text-red-600 animate-pulse border-red-200">
           {liveSessions.length} Auctions Live
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* --- LEFT: LAUNCHPAD (Client Component) --- */}
        <div className="lg:col-span-4 space-y-4">
           <BiddingLaunchForm orders={availableOrders} />
        </div>

        {/* --- RIGHT: LIVE AUCTIONS LIST --- */}
        <div className="lg:col-span-8 space-y-4">
          <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider">Active Bidding Rooms</h3>
          
          {liveSessions.length === 0 ? (
            <div className="bg-white p-10 rounded-3xl border border-dashed border-gray-200 text-center text-gray-400">
               <Gavel className="h-10 w-10 mx-auto mb-3 opacity-20" />
               <p>No active auctions.</p>
            </div>
          ) : (
            liveSessions.map((session) => (
              <div key={session.id} className="bg-white p-5 rounded-2xl shadow-sm border border-brand-highlight flex flex-col md:flex-row justify-between items-center gap-4">
                 
                 {/* Details */}
                 <div className="flex items-center gap-4">
                   <div className="bg-red-50 text-red-600 p-3 rounded-xl">
                      <Timer className="h-6 w-6 animate-pulse" />
                   </div>
                   <div>
                      <h4 className="font-black text-lg text-slate-800">{session.order.orderNo}</h4>
                      <div className="text-xs text-gray-500 font-medium flex items-center gap-1">
                        {session.order.fromLocation} <ArrowRight className="h-3 w-3" /> {session.order.toLocation}
                      </div>
                      <div className="mt-1 inline-flex items-center gap-2 bg-gray-100 px-2 py-0.5 rounded text-[10px] font-bold text-gray-600">
                        Base: ₹{session.basePrice.toLocaleString()} • {session._count.bids} Bids Received
                      </div>
                   </div>
                 </div>

                 {/* Timer & Action */}
                 <div className="text-right flex flex-col items-end gap-2">
                    <p className="text-xs font-bold text-red-500 uppercase">Ends At</p>
                    <p className="font-mono text-xl font-black text-slate-800">
                      {new Date(session.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                    
                    <form action={stopBiddingAction.bind(null, session.id)}>
                      <Button size="sm" variant="outline" className="h-8 text-xs border-red-200 text-red-600 hover:bg-red-50">
                        <StopCircle className="h-3 w-3 mr-1" /> Stop Early
                      </Button>
                    </form>
                 </div>
              </div>
            ))
          )}

          {/* --- NEW SECTION: AUCTION HISTORY --- */}
          <div className="mt-10 pt-10 border-t border-slate-200">
             <h3 className="font-bold text-slate-400 text-sm uppercase tracking-wider mb-4">Stopped / Ended Auctions</h3>
             
             <div className="space-y-3">
               {historySessions.length === 0 && <p className="text-sm text-slate-400 italic">No history yet.</p>}
               
               {historySessions.map(session => (
                 <div key={session.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center opacity-75 hover:opacity-100 transition">
                    <div className="flex items-center gap-3">
                       <div className="bg-slate-200 p-2 rounded-lg">
                          <StopCircle className="h-5 w-5 text-slate-500" />
                       </div>
                       <div>
                           <h4 className="font-bold text-slate-700">{session.order.orderNo}</h4>
                           <p className="text-xs text-slate-500">
                             Ended: {new Date(session.endTime).toLocaleString()} • Bids: {session._count.bids}
                           </p>
                       </div>
                    </div>
                    
                    {/* REPOST BUTTON */}
                    <form action={async () => {
                      "use server";
                      const { repostAuctionAction } = await import("@/actions/bidding-actions");
                      await repostAuctionAction(session.id);
                    }}>
                       <Button size="sm" variant="outline" className="h-8 text-xs border-slate-300 hover:bg-blue-50 hover:text-blue-600 gap-2">
                         <RefreshCcw className="h-3 w-3" /> Repost
                       </Button>
                    </form>
                 </div>
               ))}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}