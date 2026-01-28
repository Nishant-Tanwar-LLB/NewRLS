import { PrismaClient } from "@prisma/client";
import { verifyOwnerAction, verifyTruckAction } from "@/actions/verification-actions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileCheck, CheckCircle2, XCircle, FileText, Truck, User, MapPin 
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const prisma = new PrismaClient();

export default async function VerificationPage() {
  // 1. Fetch PENDING Owners
  const pendingOwners = await prisma.truckOwner.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" }
  });

  // 2. Fetch PENDING Trucks (Where the OWNER is already Approved)
  const pendingTrucks = await prisma.truck.findMany({
    where: { 
      status: "PENDING",
      owner: { status: "APPROVED" } // Only show trucks if owner is verified
    },
    include: { owner: true },
    orderBy: { createdAt: "asc" }
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-brand-highlight">
        <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
          <FileCheck className="text-brand-primary h-7 w-7" />
          Verification Center
        </h1>
        <p className="text-xs text-gray-500 font-medium ml-9">
          Step 1: Verify Owner. Step 2: Verify their Trucks.
        </p>
      </div>

      {/* TABS FOR OWNER vs TRUCK */}
      <Tabs defaultValue="owners" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mb-6">
          <TabsTrigger value="owners">New Partners ({pendingOwners.length})</TabsTrigger>
          <TabsTrigger value="trucks">New Vehicles ({pendingTrucks.length})</TabsTrigger>
        </TabsList>

        {/* TAB 1: OWNERS QUEUE */}
        <TabsContent value="owners" className="space-y-4">
          {pendingOwners.length === 0 ? (
            <EmptyState message="No pending partner applications." />
          ) : (
            pendingOwners.map((owner) => (
              <OwnerCard key={owner.id} owner={owner} />
            ))
          )}
        </TabsContent>

        {/* TAB 2: TRUCKS QUEUE */}
        <TabsContent value="trucks" className="space-y-4">
          {pendingTrucks.length === 0 ? (
            <EmptyState message="No new vehicles to verify." />
          ) : (
            pendingTrucks.map((truck) => (
              <TruckCard key={truck.id} truck={truck} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// --- COMPONENT: OWNER CARD ---
function OwnerCard({ owner }: { owner: any }) {
  return (
    <Card className="overflow-hidden border-brand-highlight shadow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-8 p-6 space-y-4">
          <div className="flex items-center gap-4">
             <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                <User className="h-5 w-5" />
             </div>
             <div>
                <h3 className="font-bold text-lg text-slate-800">{owner.fullName}</h3>
                <p className="text-xs text-gray-500">{owner.companyName || "Individual"}</p>
             </div>
          </div>
          <div className="flex gap-2">
             <Button variant="outline" size="sm" className="text-xs"><FileText className="h-3 w-3 mr-1" /> View Aadhar</Button>
             <Button variant="outline" size="sm" className="text-xs"><FileText className="h-3 w-3 mr-1" /> View PAN</Button>
          </div>
        </div>
        <div className="lg:col-span-4 bg-gray-50 p-6 flex flex-col justify-center gap-2 border-l">
            <form action={verifyOwnerAction.bind(null, owner.id, "APPROVE")}>
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-8 text-xs">Approve Partner</Button>
            </form>
            <form action={verifyOwnerAction.bind(null, owner.id, "REJECT")}>
                <Button variant="ghost" className="w-full text-red-600 h-8 text-xs hover:bg-red-50">Reject</Button>
            </form>
        </div>
      </div>
    </Card>
  );
}

// --- COMPONENT: TRUCK CARD ---
function TruckCard({ truck }: { truck: any }) {
  return (
    <Card className="overflow-hidden border-brand-highlight shadow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-8 p-6 space-y-4">
          <div className="flex items-center gap-4">
             <div className="h-10 w-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                <Truck className="h-5 w-5" />
             </div>
             <div>
                <h3 className="font-black text-xl text-slate-800 uppercase">{truck.vehicleNumber}</h3>
                <p className="text-xs text-gray-500">Owner: {truck.owner.fullName}</p>
             </div>
             <Badge variant="outline" className="ml-2">{truck.truckType}</Badge>
          </div>
          <div className="flex gap-2">
             <Button variant="outline" size="sm" className="text-xs"><FileText className="h-3 w-3 mr-1" /> View RC</Button>
             <Button variant="outline" size="sm" className="text-xs"><FileText className="h-3 w-3 mr-1" /> View Insurance</Button>
          </div>
        </div>
        <div className="lg:col-span-4 bg-gray-50 p-6 flex flex-col justify-center gap-2 border-l">
            <form action={verifyTruckAction.bind(null, truck.id, "APPROVE")}>
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-8 text-xs">Approve Vehicle</Button>
            </form>
            <form action={verifyTruckAction.bind(null, truck.id, "REJECT")}>
                <Button variant="ghost" className="w-full text-red-600 h-8 text-xs hover:bg-red-50">Reject</Button>
            </form>
        </div>
      </div>
    </Card>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-200">
      <p className="text-sm text-gray-400 font-medium">{message}</p>
    </div>
  );
}