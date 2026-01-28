import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { generateInvoiceAction, markCustomerPaidAction, payDriverAction } from "@/actions/finance-actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ReceiptIndianRupee, CheckCircle2, FileText, AlertCircle } from "lucide-react";

const prisma = new PrismaClient();

export default async function BillingPage() {
  const session = await getServerSession(authOptions);
  
  // 1. STRICT SECURITY CHECK 🔒
  // Only Admin & Account Managers can enter
  const userRole = session?.user?.role;
  if (userRole !== "SUPER_ADMIN" && userRole !== "ACCOUNT_MANAGER") {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-red-500">
        <AlertCircle className="h-12 w-12 mb-2" />
        <h2 className="text-xl font-bold">Access Denied</h2>
        <p>This area is restricted to the Accounts Department.</p>
      </div>
    );
  }

  // 2. FETCH DATA
  // A. Shipments that need Invoices (Status is UNBILLED)
  const pendingInvoices = await prisma.shipment.findMany({
    where: { invoiceStatus: "UNBILLED" },
    include: { order: true, truckOwner: true }
  });

  // B. Invoices generated but NOT PAID by Customer
  const unpaidInvoices = await prisma.shipment.findMany({
    where: { 
      invoiceStatus: "GENERATED", 
      customerPaymentStatus: "PENDING" 
    },
    include: { invoice: true, order: true }
  });

  // C. Drivers we haven't paid yet
  const pendingDriverPayments = await prisma.shipment.findMany({
    where: { driverPaymentStatus: "PENDING" },
    include: { truckOwner: true, truck: true }
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* HEADER */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-brand-highlight flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <ReceiptIndianRupee className="text-brand-primary h-7 w-7" />
            Accounts Department
          </h1>
          <p className="text-xs text-gray-500 font-medium ml-9">Manage Invoices & Payouts</p>
        </div>
        <div className="text-right">
             <p className="text-[10px] font-bold uppercase text-gray-400">Total Pending Collection</p>
             <p className="text-xl font-black text-green-600">
                {/* Simple calculation of pending money */}
                ₹{unpaidInvoices.reduce((sum, item) => sum + (item.invoice?.totalAmount || 0), 0).toLocaleString()}
             </p>
        </div>
      </div>

      <Tabs defaultValue="receivables" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mb-6">
          <TabsTrigger value="receivables">Receivables (From Customers)</TabsTrigger>
          <TabsTrigger value="payables">Payables (To Truckers)</TabsTrigger>
        </TabsList>

        {/* --- TAB 1: MONEY COMING IN --- */}
        <TabsContent value="receivables" className="space-y-6">
          
          {/* SECTION A: Generate New Invoices */}
          {pendingInvoices.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-bold text-slate-700 text-sm uppercase">⚠ Action Needed: Generate Invoices</h3>
              {pendingInvoices.map(shipment => (
                <Card key={shipment.id} className="p-4 border-l-4 border-l-brand-primary flex justify-between items-center">
                   <div>
                      <p className="font-bold text-slate-800">{shipment.shipmentId}</p>
                      <p className="text-xs text-gray-500">Customer: {shipment.order.customerName}</p>
                   </div>
                   <form action={generateInvoiceAction} className="flex gap-2 items-center">
                      <input type="hidden" name="shipmentId" value={shipment.id} />
                      <input type="hidden" name="amount" value={shipment.customerRate} />
                      <span className="font-mono font-bold text-slate-600 mr-4">₹{shipment.customerRate.toLocaleString()}</span>
                      <Button size="sm" className="bg-brand-primary text-white">Generate Bill</Button>
                   </form>
                </Card>
              ))}
            </div>
          )}

          {/* SECTION B: Track Pending Payments */}
          <div className="space-y-3">
             <h3 className="font-bold text-slate-700 text-sm uppercase">Waiting for Customer Payment</h3>
             {unpaidInvoices.length === 0 ? <p className="text-gray-400 text-sm italic">No pending payments.</p> : 
               unpaidInvoices.map(shipment => (
                 <Card key={shipment.id} className="p-4 flex justify-between items-center">
                    <div className="flex gap-4 items-center">
                       <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
                          <FileText className="h-5 w-5" />
                       </div>
                       <div>
                          <p className="font-bold text-slate-800">{shipment.invoice?.invoiceNo}</p>
                          <p className="text-xs text-gray-500">Due: {shipment.invoice?.dueDate.toLocaleDateString()}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="font-black text-lg text-slate-700">₹{shipment.invoice?.totalAmount.toLocaleString()}</span>
                        <form action={markCustomerPaidAction.bind(null, shipment.id)}>
                           <Button variant="outline" size="sm" className="border-green-200 text-green-700 hover:bg-green-50">
                             Mark Received
                           </Button>
                        </form>
                    </div>
                 </Card>
               ))
             }
          </div>
        </TabsContent>

        {/* --- TAB 2: MONEY GOING OUT --- */}
        <TabsContent value="payables" className="space-y-4">
           {pendingDriverPayments.length === 0 ? (
              <div className="text-center py-10 text-gray-400">All drivers have been paid.</div>
           ) : (
              pendingDriverPayments.map(shipment => (
                <Card key={shipment.id} className="p-4 border-l-4 border-l-red-400 flex justify-between items-center">
                   <div>
                      <p className="font-bold text-slate-800">{shipment.truckOwner.fullName}</p>
                      <p className="text-xs text-gray-500">
                        {shipment.truck.vehicleNumber} • {shipment.order.fromLocation} to {shipment.order.toLocation}
                      </p>
                   </div>
                   <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-[10px] uppercase font-bold text-gray-400">Payable Amount</p>
                        <p className="font-black text-lg text-red-600">₹{shipment.supplierRate.toLocaleString()}</p>
                      </div>
                      <form action={payDriverAction.bind(null, shipment.id)}>
                         <Button className="bg-green-600 hover:bg-green-700 text-white">
                            Record Payment
                         </Button>
                      </form>
                   </div>
                </Card>
              ))
           )}
        </TabsContent>

      </Tabs>
    </div>
  );
}