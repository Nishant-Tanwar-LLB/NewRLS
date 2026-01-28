import { PrismaClient } from "@prisma/client";
import { addTrackingUpdateAction } from "@/actions/tracking-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Map, Phone, Navigation, Clock } from "lucide-react";

const prisma = new PrismaClient();

// 👇 FIX 1: Update the Type Definition to Promise
export default async function TrackingPage(props: { 
  searchParams: Promise<{ id?: string }> 
}) {
  
  // 👇 FIX 2: Await the searchParams before using them
  const params = await props.searchParams;
  const selectedId = params.id;

  // ... (The rest of the code remains EXACTLY the same) ...

  // 1. Get Active Shipments
  const activeShipments = await prisma.shipment.findMany({
    where: { status: { not: "completed" } },
    include: { 
      truck: true, 
      truckOwner: true, 
      order: true,
      trackingUpdates: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    }
  });

  // 2. Get Details of SELECTED Shipment
  const selectedShipment = selectedId 
    ? await prisma.shipment.findUnique({
        where: { id: selectedId },
        include: { 
            order: true, 
            truck: true, 
            trackingUpdates: { orderBy: { createdAt: 'desc' } } 
        }
      })
    : null;

  return (
    // ... (Keep the rest of your JSX exactly as it was) ...
    <div className="h-[calc(100vh-100px)] grid grid-cols-12 gap-6 animate-in fade-in">
        {/* ... existing code ... */}
        
        {/* --- LEFT: SHIPMENT LIST --- */}
        <div className="col-span-4 bg-white rounded-3xl border border-brand-highlight overflow-hidden flex flex-col">
            <div className="p-4 bg-brand-cream border-b border-brand-highlight">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <Map className="h-5 w-5 text-brand-primary" /> Active Loads ({activeShipments.length})
            </h2>
            </div>
            <div className="overflow-y-auto flex-1 p-2 space-y-2">
            {activeShipments.map(shipment => {
                const lastUpdate = shipment.trackingUpdates[0];
                return (
                <a key={shipment.id} href={`/dashboard/tracking?id=${shipment.id}`} className="block">
                    {/* 👇 Fix: Add border logic for active state */}
                    <div className={`p-4 rounded-xl border transition-all hover:bg-blue-50 cursor-pointer ${selectedId === shipment.id ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-300' : 'bg-white border-gray-100'}`}>
                        <div className="flex justify-between mb-1">
                        <span className="font-bold text-slate-800 text-sm">{shipment.truck.vehicleNumber}</span>
                        <span className="text-[10px] font-bold text-gray-400">{shipment.shipmentId}</span>
                        </div>
                        <div className="text-xs text-gray-500 mb-2">
                        {shipment.order.fromLocation} ➔ {shipment.order.toLocation}
                        </div>
                        {lastUpdate ? (
                            <Badge variant="secondary" className="text-[10px] bg-gray-100 text-gray-600">
                            📍 {lastUpdate.location}
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="text-[10px] text-orange-400 border-orange-200">
                            No updates yet
                            </Badge>
                        )}
                    </div>
                </a>
                );
            })}
            </div>
        </div>

        {/* --- RIGHT: TIMELINE & ACTION --- */}
        <div className="col-span-8 space-y-6 overflow-y-auto">
            {!selectedShipment ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-white/50 rounded-3xl border border-dashed border-gray-300">
                    <Navigation className="h-16 w-16 mb-4 opacity-20" />
                    <p>Select a truck from the left to log an update.</p>
                </div>
            ) : (
                <>
                   {/* ... (Keep the tracking form and timeline code you already have) ... */}
                   {/* I am omitting it here to save space, just paste your existing Right Side code here */}
                   
                   <Card className="bg-brand-primary text-white border-0 shadow-lg">
                        <CardContent className="p-6 flex justify-between items-center">
                            <div>
                                <h1 className="text-2xl font-black">{selectedShipment.truck.vehicleNumber}</h1>
                                <p className="text-brand-cream opacity-90 text-sm font-medium">
                                    Driver: {selectedShipment.driverName} • {selectedShipment.driverPhone}
                                </p>
                            </div>
                            <a href={`tel:${selectedShipment.driverPhone}`}>
                                <Button className="bg-white text-brand-primary hover:bg-brand-cream font-bold">
                                    <Phone className="h-4 w-4 mr-2" /> Call Driver
                                </Button>
                            </a>
                        </CardContent>
                    </Card>

                    <Card className="border-brand-highlight">
                        <CardHeader className="pb-3 border-b border-gray-100 bg-gray-50/50">
                            <CardTitle className="text-sm font-bold uppercase text-gray-500">Log New Status</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                            <form action={addTrackingUpdateAction} className="flex gap-4 items-end">
                                <input type="hidden" name="shipmentId" value={selectedShipment.id} />
                                
                                <div className="flex-1 space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Current Location</label>
                                    <Input name="location" placeholder="e.g. Crossing Jaipur Border" required className="h-9" />
                                </div>
                                
                                <div className="w-40 space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Status</label>
                                    <select name="status" className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm font-medium" required>
                                        <option value="IN_TRANSIT">In Transit 🚚</option>
                                        <option value="STOPPED">Stopped / Break ☕</option>
                                        <option value="DELAYED">Delayed ⚠️</option>
                                        <option value="DELIVERED">Delivered ✅</option>
                                    </select>
                                </div>

                                <div className="flex-1 space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Remarks (Optional)</label>
                                    <Input name="remarks" placeholder="Any issues?" className="h-9" />
                                </div>

                                <Button type="submit" className="bg-green-600 hover:bg-green-700 h-9">Update</Button>
                            </form>
                        </CardContent>
                    </Card>

                    <div className="bg-white rounded-3xl border border-brand-highlight p-6">
                        <h3 className="font-bold text-slate-700 mb-6 flex items-center gap-2">
                            <Clock className="h-5 w-5 text-gray-400" /> Trip History
                        </h3>
                        
                        <div className="relative border-l-2 border-gray-200 ml-3 space-y-8 pb-4">
                            {selectedShipment.trackingUpdates.length === 0 ? (
                                <p className="pl-6 text-sm text-gray-400 italic">Trip just started. No updates logged yet.</p>
                            ) : (
                                selectedShipment.trackingUpdates.map((update, idx) => (
                                    <div key={update.id} className="relative pl-6">
                                        <div className={`absolute -left-[9px] top-0 h-4 w-4 rounded-full border-2 border-white shadow-sm 
                                            ${idx === 0 ? 'bg-brand-primary ring-2 ring-brand-primary/20' : 'bg-gray-300'}`}>
                                        </div>
                                        <div>
                                            <div className="flex justify-between items-start">
                                                <p className={`font-bold text-sm ${idx === 0 ? 'text-brand-primary' : 'text-slate-600'}`}>
                                                    {update.location}
                                                </p>
                                                <span className="text-[10px] text-gray-400 font-mono">
                                                    {update.createdAt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', day: 'numeric', month: 'short'})}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant="outline" className="text-[10px] uppercase">{update.status.replace("_", " ")}</Badge>
                                                {update.remarks && <span className="text-xs text-gray-500">— {update.remarks}</span>}
                                                <span className="text-[10px] text-gray-300 italic ml-auto">by {update.createdBy}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </>
            )}
        </div>
    </div>
  );
}