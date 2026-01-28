import { PrismaClient } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Truck, Clock, CheckCircle, MapPin, Users, AlertCircle, ArrowUpRight, ShieldCheck } from "lucide-react";
import Link from "next/link";

const prisma = new PrismaClient();

export default async function OperationsDashboard({ user }: { user: any }) {
  // 1. DETERMINE RANK
  const isHighCommand = ["DEPT_HEAD", "ZONAL_MANAGER", "REGION_MANAGER"].includes(user.role);
  const isGroundTeam = ["OFFICE_MANAGER", "SUPERVISOR", "EMPLOYEE"].includes(user.role);

  // 2. FETCH DATA
  const totalTrucks = await prisma.truckOwner.count();
  const pendingApprovals = await prisma.truckOwner.count({ where: { status: "PENDING" } });
  
  const myTeamCount = await prisma.user.count({
    where: isGroundTeam 
      ? { officeId: user.officeId } 
      : { department: "OPERATIONS" }
  });

  // Fetch recent 3 trucks for the "Live Feed" look
  const recentTrucks = await prisma.truckOwner.findMany({
    take: 3,
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* --- HEADER SECTION --- */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FF7D29] to-[#FFBF78] p-8 shadow-xl shadow-orange-200/50">
        {/* Background Pattern Decoration */}
        <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-white/10 blur-2xl"></div>

        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-white/20 p-2 backdrop-blur-sm">
                {isHighCommand ? <Truck className="text-white h-6 w-6" /> : <MapPin className="text-white h-6 w-6" />}
              </div>
              <h1 className="text-3xl font-black tracking-tight text-white">
                {isHighCommand ? "Operations Control" : "Branch Hub"}
              </h1>
            </div>
            <p className="mt-2 text-orange-50 font-medium">
              {isHighCommand 
                ? `Welcome back, Commander ${user.name}` 
                : `Supervisor: ${user.name} • ${user.office?.name || 'Field Unit'}`}
            </p>
          </div>
          
          <div className="flex gap-3">
             {/* Glass Button */}
            <Link href="/dashboard/verification">
                <Button className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-md border border-white/40 shadow-lg">
                <Clock className="mr-2 h-4 w-4" /> 
                {isHighCommand ? `Pending (${pendingApprovals})` : "My Tasks"}
                </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* --- STATS GRID (Modern Floating Cards) --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Total Fleet */}
        <div className="group relative overflow-hidden rounded-3xl bg-white p-6 shadow-sm border border-[#FFEEA9] transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Total Fleet</p>
              <h2 className="mt-2 text-4xl font-black text-[#FF7D29]">{totalTrucks}</h2>
            </div>
            <div className="h-12 w-12 rounded-full bg-[#FEFFD2] flex items-center justify-center text-[#FF7D29] group-hover:scale-110 transition-transform">
              <Truck className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs font-medium text-green-600 bg-green-50 w-fit px-2 py-1 rounded-full">
            <ArrowUpRight className="h-3 w-3" /> +12% this week
          </div>
        </div>

        {/* Card 2: Active Team */}
        <div className="group relative overflow-hidden rounded-3xl bg-white p-6 shadow-sm border border-[#FFEEA9] transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Active Staff</p>
              <h2 className="mt-2 text-4xl font-black text-slate-800">{myTeamCount}</h2>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
              <Users className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs font-medium text-blue-600 bg-blue-50 w-fit px-2 py-1 rounded-full">
             <ShieldCheck className="h-3 w-3" /> Fully Staffed
          </div>
        </div>

        {/* Card 3: Pending Action */}
        <div className="group relative overflow-hidden rounded-3xl bg-white p-6 shadow-sm border border-[#FFEEA9] transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Pending</p>
              <h2 className={`mt-2 text-4xl font-black ${pendingApprovals > 0 ? "text-red-500" : "text-green-500"}`}>
                {pendingApprovals}
              </h2>
            </div>
            <div className="h-12 w-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
              <AlertCircle className="h-6 w-6" />
            </div>
          </div>
          <p className="mt-4 text-xs text-gray-400">Requires verification</p>
        </div>
      </div>

      {/* --- RECENT ACTIVITY (Modern List) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Registrations */}
        <Card className="border-none shadow-sm bg-white/60 backdrop-blur-sm rounded-3xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-800">Recent Arrivals</CardTitle>
          </CardHeader>
          <CardContent>
            {recentTrucks.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-10 text-gray-400 opacity-50">
                  <Truck className="h-12 w-12 mb-3" />
                  <p>No activity yet</p>
               </div>
            ) : (
              <div className="space-y-4">
                {recentTrucks.map((truck, i) => (
                  <div key={truck.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm
                        ${i === 0 ? "bg-[#FF7D29]" : "bg-slate-300"}
                      `}>
                        {truck.fullName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{truck.fullName}</p>
                        <p className="text-xs text-gray-500 font-mono">{truck.phone}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide
                      ${truck.status === 'PENDING' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}
                    `}>
                      {truck.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Live System Status */}
        <Card className="border-none shadow-sm bg-[#FF7D29]/5 rounded-3xl">
            <CardHeader>
                <CardTitle className="text-xl font-bold text-[#FF7D29]">System Health</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="font-medium text-slate-700">Server Status</span>
                        </div>
                        <span className="text-sm font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full">Online</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                            <span className="font-medium text-slate-700">Database Sync</span>
                        </div>
                        <span className="text-xs text-gray-500 font-mono">Just now</span>
                    </div>

                    <div className="p-4 bg-white rounded-2xl border border-orange-200 mt-4">
                        <h4 className="text-sm font-bold text-slate-800 mb-1">💡 Pro Tip</h4>
                        <p className="text-xs text-gray-500 leading-relaxed">
                            Managers can now assign trucks directly from the map view. Check the "Live Map" tab for updates.
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}