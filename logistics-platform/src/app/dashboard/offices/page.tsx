import { PrismaClient } from "@prisma/client";
import CreateOfficeModal from "@/components/offices/CreateOfficeModal";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Map, MapPin, Users } from "lucide-react";

const prisma = new PrismaClient();

export default async function OfficePage() {
  // 1. Fetch Data
  const offices = await prisma.office.findMany({
    include: { zone: true, staff: true },
    orderBy: { name: 'asc' }
  });
  
  const zones = await prisma.zone.findMany();

  // 2. GROUP OFFICES BY ZONE
  // Result: { "North Zone": [Office1, Office2], "South Zone": [Office3] }
  const groupedOffices: Record<string, typeof offices> = {};

  offices.forEach((office) => {
    const zoneName = office.zone?.name || "Unassigned Zone";
    if (!groupedOffices[zoneName]) {
      groupedOffices[zoneName] = [];
    }
    groupedOffices[zoneName].push(office);
  });

  return (
    <div className="p-8 space-y-10 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-brand-highlight">
        <div>
           <h1 className="text-3xl font-black text-brand-dark">Network Management</h1>
           <p className="text-slate-500 font-medium">Manage Branches & Zones</p>
        </div>
        <CreateOfficeModal zones={zones} />
      </div>

      {/* ZONE SECTIONS */}
      {Object.entries(groupedOffices).map(([zoneName, zoneOffices]) => (
        <section key={zoneName} className="space-y-6 pt-6">
           
           {/* Zone Header - Orange Accent */}
           <div className="flex items-center gap-3 border-b border-brand-highlight pb-4">
              <div className="bg-orange-100 p-2 rounded-lg text-brand-primary">
                 <Map className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-black text-brand-dark">{zoneName}</h2>
              <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-200">
                {zoneOffices.length} Branches
              </Badge>
           </div>

           {/* Offices Grid */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {zoneOffices.map((office) => (
                <Card key={office.id} className="p-5 hover:shadow-md transition-shadow border-brand-highlight group">
                   <div className="flex justify-between items-start">
                      <div className="flex items-center gap-4">
                         {/* Icon Circle */}
                         <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-orange-50 group-hover:text-brand-primary transition-colors">
                            <MapPin className="h-6 w-6" />
                         </div>
                         
                         <div>
                            <h3 className="font-bold text-lg text-brand-dark">{office.name}</h3>
                            <p className="text-xs text-slate-500 font-medium">{office.city}</p>
                         </div>
                      </div>

                      {/* Staff Count Badge */}
                      <div className="flex flex-col items-end">
                         <span className="text-2xl font-black text-slate-200 group-hover:text-brand-dark transition-colors">
                           {office.staff.length}
                         </span>
                         <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                           <Users className="h-3 w-3" /> Staff
                         </span>
                      </div>
                   </div>
                </Card>
              ))}
           </div>
        </section>
      ))}

      {/* EMPTY STATE */}
      {offices.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
          <Map className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-400 font-medium">No offices found in the network.</p>
          <p className="text-xs text-slate-300">Click "Add New Branch" to expand your reach.</p>
        </div>
      )}

    </div>
  );
}