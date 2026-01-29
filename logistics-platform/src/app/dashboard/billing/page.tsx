import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { generateInvoiceAction, markCustomerPaidAction, payDriverAction } from "@/actions/finance-actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReceiptIndianRupee, FileText, AlertCircle, History, CheckCircle2, ArrowUpRight, ArrowDownLeft } from "lucide-react";

const prisma = new PrismaClient();

export default async function BillingPage() {
  const session = await getServerSession(authOptions);
  
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

  // 1. FETCH LIVE DATA (Pending Actions)
  const pendingInvoices = await prisma.shipment.findMany({
    where: { invoiceState: "UNBILLED" }, 
    include: { order: true, truckOwner: true }
  });

  const unpaidInvoices = await prisma.shipment.findMany({
    where: { 
      invoiceState: "GENERATED",      
      customerPaymentStatus: "PENDING" 
    },
    include: { invoice: true, order: true }
  });

  const pendingDriverPayments = await prisma.shipment.findMany({
    where: { driverPaymentStatus: "PENDING" },
    include: { truckOwner: true, truck: true, order: true }
  });

  // 2. FETCH HISTORY DATA (Completed Actions)
  const completedInvoices = await prisma.shipment.findMany({
    where: { customerPaymentStatus: "RECEIVED" },
    include: { invoice: true, order: true },
    orderBy: { updatedAt: 'desc' },
    take: 20 // Show last 20 records
  });

  const completedDriverPayments = await prisma.shipment.findMany({
    where: { driverPaymentStatus: "PAID" },
    include: { truckOwner: true, truck: true, order: true },
    orderBy: { updatedAt: 'desc' },
    take: 20
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* HEADER */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-brand-highlight flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-brand-dark flex items-center gap-2">
            <ReceiptIndianRupee className="text-brand-primary h-7 w-7" />
            Accounts Department
          </h1>
          <p className="text-xs text-slate-500 font-medium ml-9">Manage Invoices & Payouts</p>
        </div>
        <div className="text-right">
             <p className="text-[10px] font-bold uppercase text-slate-400">Total Pending Collection</p>
             <p className="text-xl font-black text-green-600">
                ₹{unpaidInvoices.reduce((sum, item) => sum + (item.invoice?.totalAmount || 0), 0).toLocaleString()}
             </p>
        </div>
      </div>

      <Tabs defaultValue="receivables" className="w-full">
        {/* TAB NAVIGATION */}
        <TabsList className="grid w-full grid-cols-3 max-w-xl mb-6">
          <TabsTrigger value="receivables">Receivables (In)</TabsTrigger>
          <TabsTrigger value="payables">Payables (Out)</TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" /> History
          </TabsTrigger>
        </TabsList>

        {/* --- TAB 1: MONEY COMING IN --- */}
        <TabsContent value="receivables" className="space-y-6">
          {pendingInvoices.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-bold text-slate-700 text-sm uppercase">⚠ Action Needed: Generate Invoices</h3>
              {pendingInvoices.map(shipment => (
                <Card key={shipment.id} className="p-4 border-l-4 border-l-brand-primary flex justify-between items-center shadow-sm">
                   <div>
                      <p className="font-bold text-slate-800">{shipment.shipmentId}</p>
                      <p className="text-xs text-slate-500">Customer: {shipment.order.customerName}</p>
                   </div>
                   <form action={generateInvoiceAction} className="flex gap-2 items-center">
                      <input type="hidden" name="shipmentId" value={shipment.id} />
                      <input type="hidden" name="amount" value={shipment.customerRate} />
                      <span className="font-mono font-bold text-slate-600 mr-4">₹{shipment.customerRate.toLocaleString()}</span>
                      <Button size="sm" className="bg-brand-primary hover:bg-orange-700 text-white font-bold">Generate Bill</Button>
                   </form>
                </Card>
              ))}
            </div>
          )}

          <div className="space-y-3">
             <h3 className="font-bold text-slate-700 text-sm uppercase">Waiting for Customer Payment</h3>
             {unpaidInvoices.length === 0 ? <p className="text-slate-400 text-sm italic">No pending payments.</p> : 
               unpaidInvoices.map(shipment => (
                 <Card key={shipment.id} className="p-4 flex justify-between items-center border-brand-highlight hover:shadow-md transition-shadow">
                    <div className="flex gap-4 items-center">
                       <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
                          <FileText className="h-5 w-5" />
                       </div>
                       <div>
                          <p className="font-bold text-slate-800">{shipment.invoice?.invoiceNo}</p>
                          <p className="text-xs text-slate-500">Due: {shipment.invoice?.dueDate.toLocaleDateString()}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="font-black text-lg text-slate-700">₹{shipment.invoice?.totalAmount.toLocaleString()}</span>
                        <form action={markCustomerPaidAction.bind(null, shipment.id)}>
                           <Button variant="outline" size="sm" className="border-green-200 text-green-700 hover:bg-green-50 font-bold">
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
              <div className="text-center py-10 text-slate-400 border border-dashed border-slate-200 rounded-xl">All drivers have been paid.</div>
           ) : (
              pendingDriverPayments.map(shipment => (
                <Card key={shipment.id} className="p-4 border-l-4 border-l-red-400 flex justify-between items-center shadow-sm">
                   <div>
                      <p className="font-bold text-slate-800">{shipment.truckOwner.fullName}</p>
                      <p className="text-xs text-slate-500">
                        {shipment.truck.vehicleNumber} • {shipment.order.fromLocation} to {shipment.order.toLocation}
                      </p>
                   </div>
                   <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-[10px] uppercase font-bold text-slate-400">Payable Amount</p>
                        <p className="font-black text-lg text-red-600">₹{shipment.supplierRate.toLocaleString()}</p>
                      </div>
                      <form action={payDriverAction.bind(null, shipment.id)}>
                         <Button className="bg-green-600 hover:bg-green-700 text-white font-bold">
                            Record Payment
                         </Button>
                      </form>
                   </div>
                </Card>
              ))
           )}
        </TabsContent>

        {/* --- TAB 3: HISTORY (NEW) --- */}
        <TabsContent value="history" className="space-y-8">
           
           {/* 1. PAST REVENUE (IN) */}
           <div>
              <h3 className="font-bold text-slate-700 text-sm uppercase mb-3 flex items-center gap-2">
                 <ArrowDownLeft className="h-4 w-4 text-green-600" /> Completed Collections (Revenue)
              </h3>
              <div className="space-y-2">
                 {completedInvoices.map(shipment => (
                    <div key={shipment.id} className="flex justify-between items-center p-3 bg-green-50/50 rounded-lg border border-green-100">
                       <div className="flex items-center gap-3">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <div>
                             <p className="font-bold text-sm text-slate-800">{shipment.order.customerName}</p>
                             <p className="text-[10px] text-slate-500">Inv: {shipment.invoice?.invoiceNo}</p>
                          </div>
                       </div>
                       <span className="font-bold text-green-700">+₹{shipment.invoice?.totalAmount.toLocaleString()}</span>
                    </div>
                 ))}
                 {completedInvoices.length === 0 && <p className="text-xs text-slate-400 pl-2">No history yet.</p>}
              </div>
           </div>

           {/* 2. PAST EXPENSES (OUT) */}
           <div>
              <h3 className="font-bold text-slate-700 text-sm uppercase mb-3 flex items-center gap-2">
                 <ArrowUpRight className="h-4 w-4 text-red-600" /> Completed Payouts (Drivers)
              </h3>
              <div className="space-y-2">
                 {completedDriverPayments.map(shipment => (
                    <div key={shipment.id} className="flex justify-between items-center p-3 bg-red-50/50 rounded-lg border border-red-100">
                       <div className="flex items-center gap-3">
                          <CheckCircle2 className="h-4 w-4 text-red-600" />
                          <div>
                             <p className="font-bold text-sm text-slate-800">{shipment.truckOwner.fullName}</p>
                             <p className="text-[10px] text-slate-500">{shipment.truck.vehicleNumber}</p>
                          </div>
                       </div>
                       <span className="font-bold text-red-700">-₹{shipment.supplierRate.toLocaleString()}</span>
                    </div>
                 ))}
                 {completedDriverPayments.length === 0 && <p className="text-xs text-slate-400 pl-2">No history yet.</p>}
              </div>
           </div>

        </TabsContent>

      </Tabs>
    </div>
  );
}