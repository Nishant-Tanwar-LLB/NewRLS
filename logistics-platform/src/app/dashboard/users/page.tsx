import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import CreateUserModal from "@/components/users/CreateUserModal"; 
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Map } from "lucide-react";

const prisma = new PrismaClient();

export default async function UsersPage() {
  const session = await getServerSession(authOptions);
  
  // 1. Get Current User
  const currentUser = await prisma.user.findUnique({
    where: { email: session?.user?.email! },
    include: { office: { include: { zone: true } } }
  });

  if (!currentUser) return <div>Access Denied</div>;

  const isSuperAdmin = currentUser.role === "SUPER_ADMIN";

  // 2. Fetch Users
  let users;
  if (isSuperAdmin) {
    users = await prisma.user.findMany({ 
      include: { office: { include: { zone: true } } }, 
      orderBy: { createdAt: "desc" } 
    });
  } else {
    users = await prisma.user.findMany({
      where: {
        department: currentUser.department,
        officeId: currentUser.officeId || undefined
      },
      include: { office: { include: { zone: true } } }, 
      orderBy: { createdAt: "desc" }
    });
  }

  const offices = await prisma.office.findMany();

  // 3. Group Users
  const corporateUsers = users.filter(u => !u.officeId);
  const officeUsers = users.filter(u => u.officeId);

  const groupedByZone: Record<string, Record<string, typeof users>> = {};

  officeUsers.forEach(user => {
    const zoneName = user.office?.zone?.name || "Unzoned Offices";
    const officeName = user.office?.name || "Unknown Office";

    if (!groupedByZone[zoneName]) groupedByZone[zoneName] = {};
    if (!groupedByZone[zoneName][officeName]) groupedByZone[zoneName][officeName] = [];
    
    groupedByZone[zoneName][officeName].push(user);
  });

  return (
    <div className="p-8 space-y-10 animate-in fade-in duration-500">
      
      {/* HEADER - Updated to Brand Colors */}
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-brand-highlight">
        <div>
           <h1 className="text-3xl font-black text-brand-dark">Team Management</h1>
           <p className="text-slate-500 font-medium">Organize staff by Zones & Offices</p>
        </div>
        <CreateUserModal currentUser={currentUser} offices={offices} />
      </div>

      {/* 1. CORPORATE LIST */}
      {corporateUsers.length > 0 && (
        <section className="space-y-4">
           <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2 uppercase tracking-wider">
              <Building2 className="text-brand-primary h-5 w-5" /> Corporate / HQ Staff
           </h2>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {corporateUsers.map(user => <UserCard key={user.id} user={user} />)}
           </div>
        </section>
      )}

      {/* 2. ZONE LIST */}
      {Object.entries(groupedByZone).map(([zoneName, officesInZone]) => (
        <section key={zoneName} className="space-y-6 pt-6 border-t border-brand-highlight">
           
           {/* Zone Header - Orange Accent */}
           <div className="flex items-center gap-2">
              <div className="bg-orange-100 p-2 rounded-lg text-brand-primary">
                 <Map className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-black text-brand-dark">{zoneName}</h2>
           </div>

           <div className="grid grid-cols-1 gap-8 pl-4 border-l-2 border-orange-100 ml-4">
              {Object.entries(officesInZone).map(([officeName, staff]) => (
                 <div key={officeName} className="space-y-3">
                    <div className="flex items-center gap-3">
                       <h3 className="text-lg font-bold text-slate-700">{officeName}</h3>
                       <Badge className="bg-brand-dark text-white hover:bg-slate-800">
                          {staff.length} Staff
                       </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                       {staff.map(user => <UserCard key={user.id} user={user} />)}
                    </div>
                 </div>
              ))}
           </div>

        </section>
      ))}
    </div>
  );
}

// --- HELPER: USER CARD (Styled with Dark Blue & Orange) ---
function UserCard({ user }: { user: any }) {
  const isSuper = user.role === 'SUPER_ADMIN';
  
  return (
    <Card className="p-4 flex items-center gap-4 hover:shadow-md transition-shadow border-brand-highlight">
      {/* Avatar Circle */}
      <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm
         ${isSuper ? 'bg-orange-100 text-brand-primary' : 'bg-slate-100 text-brand-dark'}
      `}>
        {user.name.charAt(0)}
      </div>
      
      <div className="overflow-hidden">
        <h4 className="font-bold text-sm text-brand-dark truncate">{user.name}</h4>
        <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
        <div className="flex gap-2 mt-1">
           <span className="text-[9px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded uppercase">
             {user.department}
           </span>
           {/* Role Badge - Orange for High Ranks */}
           <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase
              ${isSuper ? 'bg-orange-100 text-orange-700' : 'bg-slate-50 text-slate-500'}
           `}>
             {user.role.replace("_", " ")}
           </span>
        </div>
      </div>
    </Card>
  );
}