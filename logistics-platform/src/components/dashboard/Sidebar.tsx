"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Building2,
  FileCheck,
  Map,
  LogOut,
  Truck,
  ClipboardList,
  PackageCheck,
  ReceiptIndianRupee,
  Gavel
} from "lucide-react";
import { signOut } from "next-auth/react";

const menuItems = [
  {
    name: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["SUPER_ADMIN", "DEPT_HEAD", "ZONAL_MANAGER", "REGION_MANAGER", "OFFICE_MANAGER", "SUPERVISOR", "EMPLOYEE", "VERIFIER", "ACCOUNT_MANAGER"],
  },
  // --- ADMIN ONLY ---
  {
    name: "Employee Team",
    href: "/dashboard/users",
    icon: Users,
    roles: ["SUPER_ADMIN", "DEPT_HEAD", "ZONAL_MANAGER", "REGION_MANAGER", "OFFICE_MANAGER"],
  },
  {
    name: "Offices",
    href: "/dashboard/offices",
    icon: Building2,
    roles: ["SUPER_ADMIN"],
  },
  {
    name: "Order Book",
    href: "/dashboard/orders",
    icon: ClipboardList,
    roles: ["SUPER_ADMIN", "ZONAL_MANAGER", "REGION_MANAGER", "OFFICE_MANAGER", "SUPERVISOR", "EMPLOYEE"],
  },
  // --- NEW ITEM ---
  {
    name: "Live Shipments",
    href: "/dashboard/shipments", // Ops sees this to Check status / Bidding
    icon: PackageCheck,
    roles: ["SUPER_ADMIN", "ZONAL_MANAGER", "REGION_MANAGER", "OFFICE_MANAGER", "SUPERVISOR", "EMPLOYEE"],
  },
  {
    name: "Live Bidding",
    href: "/dashboard/bidding",
    icon: Gavel, // The Judge's Hammer Icon
    roles: ["SUPER_ADMIN", "ZONAL_MANAGER", "REGION_MANAGER", "OFFICE_MANAGER", "SUPERVISOR"],
  },
  // --- PARTNER HELP DESK (Tracking & Verification) ---
  {
    name: "Verification Queue",
    href: "/dashboard/verification",
    icon: FileCheck,
    roles: ["SUPER_ADMIN", "VERIFIER"], 
  },
  {
    name: "Live Tracking", // Moved to Help Desk
    href: "/dashboard/tracking", 
    icon: Map,
    roles: ["SUPER_ADMIN", "VERIFIER"],
  },

  // --- ACCOUNTS DEPT (Money) ---
  {
    name: "Billing & Finance",
    href: "/dashboard/billing",
    icon: ReceiptIndianRupee,
    roles: ["SUPER_ADMIN", "ACCOUNT_MANAGER"],
  },
  {
    name: "Live Map",
    href: "/dashboard/map",
    icon: Map,
    roles: ["SUPER_ADMIN", "ZONAL_MANAGER", "DEPT_HEAD", "REGION_MANAGER"],
  },
];

export default function Sidebar({ userRole }: { userRole: string }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-brand-primary text-white transition-all duration-300 shadow-2xl">
      
      {/* HEADER */}
      <div className="flex h-20 items-center justify-center border-b border-brand-highlight/30">
        <div className="flex items-center gap-2">
          <div className="bg-brand-cream text-brand-primary p-2 rounded-lg shadow-sm">
            <Truck className="h-6 w-6 fill-current" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-wider leading-none text-white">RELOAD</span>
            <span className="text-[10px] font-medium tracking-widest text-brand-cream opacity-90">LOGISTIC SERVICE</span>
          </div>
        </div>
      </div>

      {/* MENU */}
      <nav className="flex-1 space-y-2 p-4">
        {menuItems.map((item) => {
          if (!item.roles.includes(userRole)) return null;

          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-bold transition-all",
                isActive 
                  ? "bg-brand-cream text-brand-primary shadow-md translate-x-1" 
                  : "text-white hover:bg-brand-secondary/40 hover:text-brand-cream"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive ? "text-brand-primary" : "")} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* FOOTER */}
      <div className="border-t border-brand-highlight/30 p-4 bg-black/5">
        <div className="flex items-center gap-3 px-4 py-2">
          <div className="h-9 w-9 rounded-full bg-brand-cream text-brand-primary flex items-center justify-center font-bold text-sm shadow-sm border-2 border-brand-highlight">
            {userRole.charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-semibold text-brand-highlight">Logged In As</span>
            <span className="text-xs font-bold text-white tracking-wide">{userRole.replace("_", " ")}</span>
          </div>
        </div>
        <button
          onClick={() => signOut()}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-brand-primary bg-brand-cream hover:bg-white transition-colors shadow-sm"
        >
          <LogOut className="h-4 w-4" />
          Log Out
        </button>
      </div>
    </div>
  );
}