import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { 
  Truck, IndianRupee, FileCheck, ClipboardList, 
  ArrowUpRight, Users, TrendingUp 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const prisma = new PrismaClient();

export default async function DashboardOverview() {
  const session = await getServerSession(authOptions);
  const userRole = session?.user?.role || "EMPLOYEE";
  const userName = session?.user?.name || "User";

  // 1. FETCH KEY METRICS
  const [
    activeShipmentsCount,
    pendingVerificationsCount,
    todaysOrdersCount,
    totalRevenue
  ] = await Promise.all([
    // Active Trucks (Shipments not completed)
    prisma.shipment.count({ where: { status: { not: "completed" } } }),
    
    // Pending Approvals (Owners + Trucks)
    prisma.truckOwner.count({ where: { status: "PENDING" } }),
    
    // Orders Created Today
    prisma.order.count({ 
      where: { 
        createdAt: { gte: new Date(new Date().setHours(0,0,0,0)) } 
      } 
    }),

    // Total Revenue (Sum of all Customer Rates on Shipments)
    prisma.shipment.aggregate({
      _sum: { customerRate: true }
    })
  ]);

  // 2. FETCH RECENT ACTIVITY (Last 5 Shipments)
  const recentShipments = await prisma.shipment.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { order: true, createdBy: true }
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-800">Welcome back, {userName} 👋</h1>
          <p className="text-gray-500 font-medium mt-1">Here is what's happening in your network today.</p>
        </div>
        <div className="text-right hidden md:block">
           <p className="text-[10px] uppercase font-bold text-gray-400">Current Role</p>
           <div className="inline-flex items-center gap-2 bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-full font-bold text-xs mt-1">
              {userRole.replace("_", " ")}
           </div>
        </div>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Active Loads */}
        <Card className="border-brand-highlight shadow-sm hover:shadow-md transition-shadow">
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-bold text-gray-500 uppercase">Live Operations</CardTitle>
             <Truck className="h-4 w-4 text-brand-primary" />
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-black text-slate-800">{activeShipmentsCount}</div>
             <p className="text-xs text-gray-400 mt-1">Trucks on the road</p>
           </CardContent>
        </Card>

        {/* Card 2: Today's Orders */}
        <Card className="border-brand-highlight shadow-sm hover:shadow-md transition-shadow">
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-bold text-gray-500 uppercase">New Orders</CardTitle>
             <ClipboardList className="h-4 w-4 text-blue-500" />
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-black text-slate-800">{todaysOrdersCount}</div>
             <p className="text-xs text-gray-400 mt-1">Booked today</p>
           </CardContent>
        </Card>

        {/* Card 3: Pending Actions */}
        <Card className="border-brand-highlight shadow-sm hover:shadow-md transition-shadow">
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-bold text-gray-500 uppercase">Pending Review</CardTitle>
             <FileCheck className="h-4 w-4 text-orange-500" />
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-black text-slate-800">{pendingVerificationsCount}</div>
             <p className="text-xs text-gray-400 mt-1">Partners waiting approval</p>
           </CardContent>
        </Card>

        {/* Card 4: Total Revenue (Admin Only) */}
        <Card className="bg-slate-900 text-white border-0 shadow-lg">
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-bold text-slate-400 uppercase">Total Revenue</CardTitle>
             <IndianRupee className="h-4 w-4 text-green-400" />
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-black text-white">
                ₹{(totalRevenue._sum.customerRate || 0).toLocaleString()}
             </div>
             <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-green-400" /> Lifetime Gross
             </p>
           </CardContent>
        </Card>
      </div>

      {/* BOTTOM SECTION: ACTIVITY FEED */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         
         {/* Recent Shipments List */}
         <Card className="border-brand-highlight">
            <CardHeader>
               <CardTitle className="text-lg font-bold text-slate-800">Recent Dispatch Activity</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="space-y-6">
                  {recentShipments.length === 0 ? (
                    <p className="text-gray-400 text-sm">No recent activity.</p>
                  ) : (
                    recentShipments.map(shipment => (
                      <div key={shipment.id} className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                         <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                               RLS
                            </div>
                            <div>
                               <p className="font-bold text-sm text-slate-800">{shipment.order.fromLocation} ➔ {shipment.order.toLocation}</p>
                               <p className="text-[10px] text-gray-400">ID: {shipment.shipmentId}</p>
                            </div>
                         </div>
                         <div className="text-right">
                            <p className="text-xs font-bold text-slate-600">{shipment.createdBy.name}</p>
                            <p className="text-[10px] text-gray-400">
                                {new Date(shipment.createdAt).toLocaleDateString()}
                            </p>
                         </div>
                      </div>
                    ))
                  )}
               </div>
            </CardContent>
         </Card>

         {/* Quick Actions (Shortcuts) */}
         <div className="space-y-6">
            <div className="bg-brand-cream/40 rounded-3xl p-6 border border-brand-highlight">
               <h3 className="font-bold text-slate-800 mb-4">Quick Shortcuts</h3>
               <div className="grid grid-cols-2 gap-4">
                  <a href="/dashboard/orders" className="bg-white p-4 rounded-xl border border-brand-highlight hover:shadow-md transition-all flex flex-col items-center justify-center text-center gap-2 group">
                     <div className="bg-blue-100 p-2 rounded-lg text-blue-600 group-hover:scale-110 transition-transform"><ClipboardList className="h-6 w-6" /></div>
                     <span className="text-xs font-bold text-slate-700">Create Order</span>
                  </a>
                  <a href="/dashboard/verification" className="bg-white p-4 rounded-xl border border-brand-highlight hover:shadow-md transition-all flex flex-col items-center justify-center text-center gap-2 group">
                     <div className="bg-orange-100 p-2 rounded-lg text-orange-600 group-hover:scale-110 transition-transform"><FileCheck className="h-6 w-6" /></div>
                     <span className="text-xs font-bold text-slate-700">Verify Partner</span>
                  </a>
                  <a href="/dashboard/tracking" className="bg-white p-4 rounded-xl border border-brand-highlight hover:shadow-md transition-all flex flex-col items-center justify-center text-center gap-2 group">
                     <div className="bg-purple-100 p-2 rounded-lg text-purple-600 group-hover:scale-110 transition-transform"><ArrowUpRight className="h-6 w-6" /></div>
                     <span className="text-xs font-bold text-slate-700">Track Load</span>
                  </a>
                  <a href="/dashboard/users" className="bg-white p-4 rounded-xl border border-brand-highlight hover:shadow-md transition-all flex flex-col items-center justify-center text-center gap-2 group">
                     <div className="bg-green-100 p-2 rounded-lg text-green-600 group-hover:scale-110 transition-transform"><Users className="h-6 w-6" /></div>
                     <span className="text-xs font-bold text-slate-700">Add Employee</span>
                  </a>
               </div>
            </div>
         </div>

      </div>
    </div>
  );
}