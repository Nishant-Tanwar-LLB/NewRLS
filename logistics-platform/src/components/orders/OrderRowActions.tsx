"use client";

import { useState } from "react";
import { Order } from "@prisma/client";
import { updateOrderAction } from "@/actions/order-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Eye,
  Pencil,
  TruckIcon,
  X,
  MapPin,
  Package,
  Calendar,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ShipOrderModal from "./ShipOrderModal";

export default function OrderRowActions({ order }: { order: Order }) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isShipOpen, setIsShipOpen] = useState(false);

  // Handle Edit Submit
  async function handleEdit(formData: FormData) {
    setIsSaving(true);
    await updateOrderAction(order.id, formData);
    setIsSaving(false);
    setIsEditOpen(false);
  }

  return (
    <>
      {/* --- THE BUTTONS (Visible in Table) --- */}
      <div className="flex justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
        {order.status === "PENDING" && (
          <Button
            onClick={() => setIsShipOpen(true)} // 👈 Open Modal
            size="sm"
            className="h-8 bg-green-600 hover:bg-green-700 text-white shadow-sm px-4 text-xs font-bold rounded-lg"
          >
            <TruckIcon className="h-3 w-3 mr-1.5" /> Ship
          </Button>
        )}

        {order.status === "PENDING" && (
          <Button
            onClick={() => setIsEditOpen(true)}
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0 rounded-lg border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-200"
            title="Edit"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        )}

        <Button
          onClick={() => setIsViewOpen(true)}
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0 rounded-lg text-gray-400 hover:bg-brand-cream hover:text-brand-primary"
          title="View"
        >
          <Eye className="h-4 w-4" />
        </Button>
      </div>
      {isShipOpen && (
        <ShipOrderModal order={order} onClose={() => setIsShipOpen(false)} />
      )}

      {/* --- MODAL 1: EDIT ORDER --- */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-brand-highlight">
            <div className="flex justify-between p-6 bg-gray-50 border-b">
              <h3 className="text-xl font-black text-slate-800">
                Edit Order: {order.orderNo}
              </h3>
              <button onClick={() => setIsEditOpen(false)}>
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            <div className="p-6">
              <form
                action={handleEdit}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {/* We use defaultValue to pre-fill the form */}
                <div>
                  <label className="text-xs font-bold text-gray-400">
                    Customer
                  </label>
                  <Input
                    name="customerName"
                    defaultValue={order.customerName}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400">
                    Rate (₹)
                  </label>
                  <Input
                    name="rate"
                    type="number"
                    defaultValue={order.rate}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400">
                    From
                  </label>
                  <Input
                    name="fromLocation"
                    defaultValue={order.fromLocation}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400">To</label>
                  <Input
                    name="toLocation"
                    defaultValue={order.toLocation}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400">
                    Material
                  </label>
                  <Input
                    name="material"
                    defaultValue={order.material}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400">
                    Weight
                  </label>
                  <Input name="weight" defaultValue={order.weight} required />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400">
                    Truck Size
                  </label>
                  <select
                    name="truckSize"
                    defaultValue={order.truckSize}
                    className="w-full h-10 px-3 border rounded-md text-sm bg-background"
                  >
                    <option value="Open Body">Open Body</option>
                    <option value="Container">Container</option>
                    <option value="Trailer">Trailer</option>
                    <option value="10 Wheeler">10 Wheeler</option>
                  </select>
                </div>

                <div className="col-span-2 flex justify-end gap-3 mt-4 pt-4 border-t">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsEditOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="bg-brand-primary text-white"
                  >
                    {isSaving ? "Saving..." : "Update Changes"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: VIEW FULL DETAILS --- */}
      {isViewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border-2 border-brand-primary/20">
            {/* Ticket Header style */}
            <div className="bg-brand-primary p-6 text-white text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-white/10 opacity-30 pattern-dots"></div>
              <h2 className="text-3xl font-black tracking-widest relative z-10">
                {order.orderNo}
              </h2>
              <Badge className="bg-white/20 text-white hover:bg-white/30 border-none mt-2 relative z-10">
                {order.status}
              </Badge>
            </div>

            <div className="p-8 space-y-6 relative">
              {/* Dashed Line Decoration */}
              <div className="absolute top-0 left-4 right-4 border-t-2 border-dashed border-gray-200"></div>

              {/* Route Section */}
              <div className="flex items-start gap-4">
                <div className="bg-orange-50 p-3 rounded-full text-brand-primary">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">
                    Route
                  </p>
                  <div className="flex items-center gap-2 text-lg font-bold text-slate-800">
                    {order.fromLocation}{" "}
                    <span className="text-gray-300">➔</span> {order.toLocation}
                  </div>
                </div>
              </div>

              {/* Customer Section */}
              <div className="flex items-start gap-4">
                <div className="bg-blue-50 p-3 rounded-full text-blue-600">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">
                    Customer
                  </p>
                  <p className="text-base font-semibold text-slate-700">
                    {order.customerName}
                  </p>
                </div>
              </div>

              {/* Load Details */}
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1">
                    <Package className="h-3 w-3" /> Material
                  </p>
                  <p className="font-semibold text-slate-800">
                    {order.material}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1">
                    <TruckIcon className="h-3 w-3" /> Truck
                  </p>
                  <p className="font-semibold text-slate-800">
                    {order.truckSize}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">
                    Weight
                  </p>
                  <p className="font-semibold text-slate-800">{order.weight}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">
                    Rate
                  </p>
                  <p className="font-bold text-brand-primary">
                    ₹ {order.rate.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center pt-4 border-t">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Calendar className="h-3 w-3" /> Created:{" "}
                  {new Date(order.createdAt).toLocaleDateString()}
                </div>
                <Button variant="outline" onClick={() => setIsViewOpen(false)}>
                  Close Ticket
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
