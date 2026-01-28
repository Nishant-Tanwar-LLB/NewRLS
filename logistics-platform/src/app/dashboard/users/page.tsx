import { getServerSession } from "next-auth"; // <--- NEW
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // <--- NEW
import { PrismaClient } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createUserAction, transferUserAction } from "@/actions/user-actions";

const prisma = new PrismaClient();

export default async function UsersPage() {
  // 1. Get Current User Info
  const session = await getServerSession(authOptions);
  const currentUser = await prisma.user.findUnique({
    where: { email: session?.user?.email! },
    include: { office: true }
  });

  if (!currentUser) return <div>Access Denied</div>;

  const isSuperAdmin = currentUser.role === "SUPER_ADMIN";
  const canAssignOffice = isSuperAdmin || currentUser.role === "DEPT_HEAD";

  // 2. Fetch Data (Filtered!)
  let users;
  if (isSuperAdmin) {
    // Admin sees EVERYONE
    users = await prisma.user.findMany({ 
      include: { office: true }, 
      orderBy: { createdAt: "desc" } 
    });
  } else {
    // Managers see ONLY their Department & Office staff
    users = await prisma.user.findMany({
      where: {
        department: currentUser.department,
        officeId: currentUser.officeId || undefined
      },
      include: { office: true },
      orderBy: { createdAt: "desc" }
    });
  }

  const offices = await prisma.office.findMany();

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          {isSuperAdmin ? "👥 All Employee Management" : `👥 My ${currentUser.department} Team`}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- HIRE NEW STAFF FORM --- */}
        <Card className="h-fit border-t-4 border-t-blue-600">
          <CardHeader>
            <CardTitle>Add New Member</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createUserAction} className="space-y-4">
              {/* Name, Email, Password inputs remain the same... */}
              <div>
                <label className="text-sm font-medium">Full Name</label>
                <Input name="name" placeholder="e.g. Rahul Sharma" required />
              </div>

              <div>
                <label className="text-sm font-medium">Email</label>
                <Input name="email" type="email" required />
              </div>

              <div>
                <label className="text-sm font-medium">Password</label>
                <Input name="password" type="password" required />
              </div>

              {/* --- ROLE SELECTION (FIXED FOR REACT) --- */}
              <div>
                <label className="text-sm font-medium">Role</label>
                
                {/* FIX 1: Add defaultValue="" here 👇 */}
                <select 
                  name="role" 
                  className="w-full p-2 border rounded-md bg-background text-sm" 
                  required
                  defaultValue="" 
                >
                  
                  {/* OPTION 1: SUPER ADMIN (Sees Everything) */}
                  {isSuperAdmin && (
                    <>
                      {/* FIX 2: Remove 'selected' from here 👇 */}
                      <option value="" disabled>Select a Role...</option>
                      <option value="DEPT_HEAD">⭐ Department Head</option>
                      <option value="ZONAL_MANAGER">Zonal Manager</option>
                      <option value="REGION_MANAGER">Region Manager</option>
                      <option value="OFFICE_MANAGER">Office Manager</option>
                      <option value="SUPERVISOR">Supervisor</option>
                      <option value="EMPLOYEE">Employee</option>
                      <option value="VERIFIER">Verifier (Help Desk)</option>
                    </>
                  )}

                  {/* OPTION 2: OPERATIONS HEAD (Sees Ops Hierarchy) */}
                  {!isSuperAdmin && currentUser.department === "OPERATIONS" && (
                    <>
                      {/* FIX 2: Remove 'selected' from here too 👇 */}
                      <option value="" disabled>Select Ops Role...</option>
                      <option value="ZONAL_MANAGER">1. Zone Manager (North/South Zone)</option>
                      <option value="REGION_MANAGER">2. Region Manager (State Head)</option>
                      <option value="OFFICE_MANAGER">3. Office Manager (Branch Head)</option>
                      <option value="SUPERVISOR">4. Supervisor (Team Leader)</option>
                      <option value="EMPLOYEE">5. Employee (Field Staff)</option>
                    </>
                  )}

                  {/* OPTION 3: PARTNER HELP DESK HEAD */}
                  {!isSuperAdmin && currentUser.department === "PARTNER_HELP_DESK" && (
                    <>
                      <option value="VERIFIER" selected>Verifier Agent</option>
                    </>
                  )}

                   {/* OPTION 4: HR HEAD */}
                   {!isSuperAdmin && currentUser.department === "HR" && (
                    <>
                      <option value="OFFICE_MANAGER">HR Manager</option>
                      <option value="EMPLOYEE">HR Executive</option>
                    </>
                  )}

                </select>
              </div>

              {/* DEPARTMENT SELECTION - FUTURE PROOF LIST */}
              {isSuperAdmin ? (
                <div>
                  <label className="text-sm font-medium">Department</label>
                  <select name="department" className="w-full p-2 border rounded-md bg-background text-sm" required>
                    <option value="OPERATIONS">🚛 Operations (Logistics & Fleet)</option>
                    <option value="HR">🤝 HR (Human Resources)</option>
                    <option value="ACCOUNTS">💰 Accounts (Finance & Billing)</option>
                    <option value="IT">💻 IT (Tech Support)</option>
                    <option value="PARTNER_HELP_DESK">🎧 Partner Help Desk (Support)</option>
                  </select>
                </div>
              ) : (
                <input type="hidden" name="department" value={currentUser.department} />
              )}

              {/* OFFICE SELECTION */}
              {/* Logic: Super Admin OR Dept Head can assign an office */}
              {canAssignOffice ? (
                <div>
                  <label className="text-sm font-medium">Assign Office</label>
                  <select name="officeId" className="w-full p-2 border rounded-md bg-background text-sm">
                    <option value="">🏢 No Specific Office (Roaming/HQ)</option>
                    {offices.map((office) => (
                      <option key={office.id} value={office.id}>
                        {office.name} ({office.city})
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-gray-400 mt-1">
                    * Required for Supervisors & Office Managers.
                  </p>
                </div>
              ) : (
                // If a normal Manager is hiring, they can only hire for their OWN office
                <input type="hidden" name="officeId" value={currentUser.officeId || ""} />
              )}

              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Add to Team
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* --- STAFF LIST --- */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold">Current Team ({users.length})</h2>
          {users.map((user) => (
            <Card key={user.id} className="p-4 flex justify-between items-center">
              <div className="flex gap-4 items-center">
                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-sm">{user.name}</h3>
                  <p className="text-xs text-gray-500">{user.email}</p>
                  <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded uppercase mt-1 inline-block mr-2">
                    {user.department}
                  </span>
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded uppercase">
                    {user.role}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>

      </div>
    </div>
  );
}