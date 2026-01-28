import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Truck, PackageCheck, ArrowRight, User, Phone, History } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ShipmentDetailsSheet from "@/components/shipments/ShipmentDetailsSheet"; // 👈 Import new component

const prisma = new PrismaClient();

export default async function ShipmentsPage() {
  const session = await getServerSession(authOptions);
  const user = await prisma.user.findUnique({
    where: { email: session?.user?.email! },
    include: { office: true }
  });

  if (!user) return <div>Not Authorized</div>;

  // HIERARCHY LOGIC
  let whereClause: any = {};
  const isBranchLevel = ["REGION_MANAGER", "OFFICE_MANAGER", "SUPERVISOR", "EMPLOYEE"].includes(user.role);
  if (isBranchLevel) {
    whereClause = { officeId: user.officeId };
  }

  // 1. FETCH LIVE SHIPMENTS (Not Completed)
  const liveShipments = await prisma.shipment.findMany({
    where: { ...whereClause, status: { not: "completed" } },
    orderBy: { createdAt: "desc" },
    include: { 
        order: true, truck: true, truckOwner: true, createdBy: true, 
        trackingUpdates: { orderBy: { createdAt: 'desc' } } // Fetch updates for the sheet
    }
  });

  // 2. FETCH HISTORY (Completed Only)
  const pastShipments = await prisma.shipment.findMany({
    where: { ...whereClause, status: "completed" },
    orderBy: { createdAt: "desc" },
    take: 50, // Limit to last 50 to keep it fast
    include: { 
        order: true, truck: true, truckOwner: true, createdBy: true,
        trackingUpdates: { orderBy: { createdAt: 'desc' } }
    }
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-brand-highlight">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3">
            <PackageCheck className="text-brand-primary h-7 w-7" />
            Shipment Manager
          </h1>
          <p className="text-xs text-gray-500 font-medium ml-10">
             Track active loads and view past history.
          </p>
        </div>
      </div>

      {/* TABS: Live vs History */}
      <Tabs defaultValue="live" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mb-4">
          <TabsTrigger value="live">Live Loads ({liveShipments.length})</TabsTrigger>
          <TabsTrigger value="history">History ({pastShipments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="live">
            <ShipmentTable shipments={liveShipments} />
        </TabsContent>

        <TabsContent value="history">
            <ShipmentTable shipments={pastShipments} isHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// --- REUSABLE TABLE COMPONENT ---
function ShipmentTable({ shipments, isHistory = false }: { shipments: any[], isHistory?: boolean }) {
    if (shipments.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 text-gray-400">
               <History className="h-12 w-12 mb-3 opacity-20" />
               <p>No shipments found in this list.</p>
            </div>
        );
    }

    return (
      <div className="bg-white rounded-3xl border border-brand-highlight shadow-sm overflow-hidden">
        <div className="grid grid-cols-12 bg-brand-cream/50 p-4 text-[11px] font-bold text-brand-primary uppercase tracking-widest border-b border-brand-highlight/50">
          <div className="col-span-2">Shipment ID</div>
          <div className="col-span-3">Route</div>
          <div className="col-span-3">Vehicle & Driver</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2 text-right pr-2">Details</div>
        </div>

        <div className="divide-y divide-gray-50">
            {shipments.map((shipment) => (
              <div key={shipment.id} className={`grid grid-cols-12 p-4 items-center hover:bg-[#FFFDF5] transition-colors group ${isHistory ? 'opacity-80 hover:opacity-100' : ''}`}>
                
                {/* ID */}
                <div className="col-span-2">
                  <div className="flex items-center gap-2">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center font-black text-[10px] 
                        ${isHistory ? 'bg-gray-200 text-gray-500' : 'bg-brand-primary text-white'}`}>
                        RLS
                    </div>
                    <div>
                        <span className="font-bold text-slate-800 text-sm block leading-none">{shipment.shipmentId}</span>
                        <span className="text-[10px] text-gray-400">Order: {shipment.order.orderNo}</span>
                    </div>
                  </div>
                </div>

                {/* Route */}
                <div className="col-span-3">
                  <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                    {shipment.order.fromLocation} <ArrowRight className="h-3 w-3 text-gray-300" /> {shipment.order.toLocation}
                  </div>
                </div>

                {/* Vehicle */}
                <div className="col-span-3">
                   <div className="flex items-center gap-2 mb-1">
                     <Truck className="h-3 w-3 text-brand-secondary" />
                     <span className="text-xs font-bold text-slate-700">{shipment.truck.vehicleNumber}</span>
                   </div>
                   <div className="flex items-center gap-2 text-[10px] text-gray-500">
                     <User className="h-3 w-3" /> {shipment.driverName}
                   </div>
                </div>

                {/* Status */}
                <div className="col-span-2">
                  <Badge className={`border-none text-[10px] capitalize shadow-none
                    ${shipment.status === 'completed' ? 'bg-gray-100 text-gray-600' : 'bg-green-50 text-green-600'}
                  `}>
                    {shipment.status.replace("_", " ")}
                  </Badge>
                </div>

                {/* Actions (Eye Button) */}
                <div className="col-span-2 flex justify-end pr-2">
                   {/* 👇 THIS IS THE NEW SIDE PANEL BUTTON */}
                   <ShipmentDetailsSheet shipment={shipment} />
                </div>

              </div>
            ))}
        </div>
      </div>
    );
}