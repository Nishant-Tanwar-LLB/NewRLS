import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Sidebar from "@/components/dashboard/Sidebar";
import SessionGuard from "@/components/auth/SessionGuard";
import Providers from "@/components/Providers"; 
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // 1. Get the Server Session
  const session = await getServerSession(authOptions);

  // 2. Security Check: If no user, kick them out
  if (!session || !session.user) {
    redirect("/login");
  }

  // 3. Get the Role (Default to EMPLOYEE if missing)
  const userRole = session.user.role || "EMPLOYEE";

  return (
    <SessionGuard>
      <div className="flex h-screen bg-gray-100">
        {/* 4. Pass the REAL Role to Sidebar */}
        <Sidebar userRole={userRole} />
        
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </SessionGuard>
  );
}