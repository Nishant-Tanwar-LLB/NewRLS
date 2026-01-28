"use client";

import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, MapPin, Truck, CheckCircle2 } from "lucide-react";

export default function ShipmentDetailsSheet({ shipment }: { shipment: any }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-lg text-gray-400 hover:bg-brand-cream hover:text-brand-primary" title="View Full History">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      
      {/* Centered Content with Scroll */}
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl p-0 gap-0 border-0 shadow-2xl">
        
        {/* Header Section */}
        <div className="bg-brand-primary p-6 text-white">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-3 text-white">
                    <span className="bg-white/20 text-white text-xs px-2 py-1 rounded border border-white/10">RLS</span>
                    <span className="text-2xl font-black tracking-tight">{shipment.shipmentId}</span>
                </DialogTitle>
            </DialogHeader>
            <div className="mt-2 text-xs text-brand-cream/80 font-medium">
             Created on {new Date(shipment.createdAt).toLocaleDateString()} by {shipment.createdBy?.name || 'System'}
            </div>
        </div>

        <div className="p-8 space-y-8 bg-white">
          
          {/* 1. ROUTE SUMMARY */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex items-start justify-between mb-3">
                    <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Pickup</p>
                    <p className="font-bold text-slate-800 text-lg leading-tight">{shipment.order.fromLocation}</p>
                    </div>
                    <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Drop</p>
                    <p className="font-bold text-slate-800 text-lg leading-tight">{shipment.order.toLocation}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 bg-white p-2 rounded border border-slate-100">
                    <Truck className="h-4 w-4 text-brand-secondary" />
                    <span className="font-bold">{shipment.truck.vehicleNumber}</span>
                </div>
              </div>

              {/* Status Badges */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col justify-center space-y-3">
                 <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-500 uppercase">Invoice</span>
                    <Badge className={shipment.invoiceStatus === 'GENERATED' ? 'bg-green-100 text-green-700 shadow-none' : 'bg-yellow-50 text-yellow-700 shadow-none'}>
                        {shipment.invoiceStatus}
                    </Badge>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-500 uppercase">Driver Payment</span>
                    <Badge className={shipment.driverPaymentStatus === 'PAID' ? 'bg-green-100 text-green-700 shadow-none' : 'bg-red-50 text-red-600 shadow-none'}>
                        {shipment.driverPaymentStatus}
                    </Badge>
                 </div>
              </div>
          </div>

          {/* 2. TRACKING TIMELINE */}
          <div>
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2 text-sm uppercase tracking-wider">
               <MapPin className="h-4 w-4 text-brand-primary" /> Tracking History
            </h3>
            
            <div className="relative border-l-2 border-slate-100 ml-2 space-y-8 pb-2">
              {shipment.trackingUpdates.length === 0 ? (
                <p className="pl-8 text-sm text-gray-400 italic">No tracking updates recorded.</p>
              ) : (
                shipment.trackingUpdates.map((update: any, idx: number) => (
                   <div key={update.id} className="relative pl-8">
                      {/* Dot */}
                      <div className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-white shadow-sm 
                         ${idx === 0 ? 'bg-brand-primary ring-4 ring-brand-primary/10' : 'bg-gray-300'}`}>
                      </div>
                      
                      {/* Data */}
                      <div>
                         <div className="flex justify-between items-start">
                            <p className={`font-bold text-sm ${idx === 0 ? 'text-brand-primary' : 'text-slate-700'}`}>
                                {update.location}
                            </p>
                            <span className="text-[10px] text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded">
                               {new Date(update.createdAt).toLocaleTimeString('en-US', {
                                  month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'
                               })}
                            </span>
                         </div>
                         <div className="flex flex-col gap-1 mt-2">
                            <Badge variant="outline" className="w-fit text-[10px] border-slate-200 text-slate-500 font-medium">
                               {update.status.replace("_", " ")}
                            </Badge>
                            {update.remarks && <p className="text-xs text-gray-500 italic mt-1">"{update.remarks}"</p>}
                         </div>
                      </div>
                   </div>
                ))
              )}

              {/* Start Point */}
              <div className="relative pl-8 opacity-60">
                 <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-green-500 border-2 border-white"></div>
                 <div className="flex justify-between items-start">
                    <p className="font-bold text-sm text-slate-700">Shipment Created</p>
                    <span className="text-[10px] text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded">
                       {new Date(shipment.createdAt).toLocaleTimeString('en-US', {
                          month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'
                       })}
                    </span>
                 </div>
              </div>
            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}