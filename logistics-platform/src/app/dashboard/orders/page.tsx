import { PrismaClient } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Package, Truck, Eye, Pencil, TruckIcon
} from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import CreateOrderModal from "@/components/orders/CreateOrderModal"; // 👈 IMPORT THE NEW POPUP
import OrderRowActions from "@/components/orders/OrderRowActions";

const prisma = new PrismaClient();

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);
  
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { createdBy: true }
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-5 rounded-3xl shadow-sm border border-brand-highlight">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <Package className="text-brand-primary h-7 w-7" />
            Shipment Orders
          </h1>
          <p className="text-xs text-gray-500 font-medium ml-9">Manage your daily bookings & fleet</p>
        </div>

        {/* This Button now opens the Popup 👇 */}
        <CreateOrderModal />
      </div>

      {/* --- ORDERS LIST (No more bulky form above it!) --- */}
      <div className="bg-white rounded-3xl border border-brand-highlight shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 bg-brand-cream/50 p-4 text-[11px] font-bold text-brand-primary uppercase tracking-widest border-b border-brand-highlight/50">
          <div className="col-span-2">Order ID</div>
          <div className="col-span-3">Route & Customer</div>
          <div className="col-span-3">Load Details</div>
          <div className="col-span-1 text-center">Status</div>
          <div className="col-span-3 text-right pr-2">Actions</div>
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-gray-50">
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Package className="h-12 w-12 mb-3 opacity-20" />
              <p>No active orders found.</p>
              <p className="text-xs">Click "Create New Order" to start.</p>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="grid grid-cols-12 p-4 items-center hover:bg-[#FFFDF5] transition-colors group">
                
                {/* 1. ID */}
                <div className="col-span-2">
                  <span className="font-black text-slate-700 bg-slate-100 px-2 py-1 rounded text-sm group-hover:bg-brand-primary group-hover:text-white transition-colors">
                    {order.orderNo}
                  </span>
                  <p className="text-[10px] text-gray-400 mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>

                {/* 2. Route */}
                <div className="col-span-3 pr-2">
                  <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                    {order.fromLocation} <span className="text-gray-300 text-[10px]">➜</span> {order.toLocation}
                  </div>
                  <p className="text-xs text-gray-500 font-medium truncate mt-0.5">{order.customerName}</p>
                </div>

                {/* 3. Details */}
                <div className="col-span-3 text-xs text-gray-600 space-y-1.5">
                   <div className="flex items-center gap-1.5">
                     <div className="h-1.5 w-1.5 rounded-full bg-brand-secondary"></div>
                     {order.material}
                   </div>
                   <div className="flex items-center gap-1.5">
                     <Truck className="h-3 w-3 text-gray-400" /> 
                     {order.truckSize} <span className="text-gray-300">|</span> {order.weight}
                   </div>
                </div>

                {/* 4. Status */}
                <div className="col-span-1 text-center">
                  <Badge className={`
                    border-none text-[10px] px-2 py-0.5 shadow-none
                    ${order.status === 'PENDING' ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'}
                  `}>
                    {order.status}
                  </Badge>
                </div>

                {/* 5. ACTIONS */}
                <div className="col-span-3">
                  <OrderRowActions order={order} />
                </div>

              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}