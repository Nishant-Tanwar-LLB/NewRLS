"use client";

import { useState, useEffect } from "react";
import { createShipmentAction } from "@/actions/shipment-actions";
import { getVerifiedSuppliersAction } from "@/actions/supplier-actions"; // 👈 IMPORT THIS
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TruckIcon, X, Loader2, AlertCircle } from "lucide-react";

export default function ShipOrderModal({
  order,
  onClose,
}: {
  order: any;
  onClose: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suppliers, setSuppliers] = useState<any[]>([]); // 👈 Store Real Suppliers here
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [loadingSuppliers, setLoadingSuppliers] = useState(true);

  // FETCH REAL DATA ON LOAD
  useEffect(() => {
    async function loadData() {
      const data = await getVerifiedSuppliersAction();
      setSuppliers(data);
      setLoadingSuppliers(false);
    }
    loadData();
  }, []);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    const res = await createShipmentAction(formData);
    if (res?.error) {
      alert("Error: " + res.error); // Simple error handling
    } else {
      onClose();
    }
    setIsSubmitting(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border-2 border-brand-primary">
        {/* Header */}
        <div className="bg-brand-primary p-6 text-white flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black">Assign Vehicle</h2>
            <p className="text-brand-cream opacity-90 text-sm">
              Order ID: {order.orderNo}
            </p>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-white/20 p-2 rounded-full"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-8">
          {loadingSuppliers ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin h-8 w-8 text-brand-primary" />
            </div>
          ) : suppliers.length === 0 ? (
            // EMPTY STATE IF NO SUPPLIERS FOUND
            <div className="text-center py-8 bg-red-50 rounded-xl border border-red-100">
              <AlertCircle className="h-10 w-10 text-red-400 mx-auto mb-2" />
              <h3 className="font-bold text-red-800">
                No Verified Suppliers Found
              </h3>
              <p className="text-sm text-red-600 mb-4">
                You need to approve a Truck Owner in the "Verification Queue"
                first.
              </p>
              <Button
                onClick={onClose}
                variant="outline"
                className="border-red-200 text-red-700 hover:bg-red-100"
              >
                Close
              </Button>
            </div>
          ) : (
            <form
              action={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <input type="hidden" name="orderId" value={order.id} />
              <input type="hidden" name="customerRate" value={order.rate} />

              {/* 1. SELECT VERIFIED SUPPLIER */}
              <div className="col-span-2">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Select Verified Supplier
                </label>
                <select
                  name="truckOwnerId"
                  className="w-full p-3 border rounded-lg bg-gray-50 font-medium focus:ring-2 ring-brand-primary outline-none"
                  required
                  onChange={(e) => {
                    const s = suppliers.find(
                      (sup) => sup.id === e.target.value,
                    );
                    setSelectedSupplier(s);
                  }}
                >
                  <option value="">-- Choose Verified Partner --</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      ✅ {s.fullName} ({s.companyName || "Indiv."})
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. SELECT VEHICLE */}
              <div className="col-span-2">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Select Verified Vehicle
                </label>
                <select
                  name="truckId"
                  className="w-full p-3 border rounded-lg bg-gray-50 font-medium"
                  required
                  disabled={!selectedSupplier}
                >
                  <option value="">-- Select Approved Truck --</option>
                  {selectedSupplier?.trucks &&
                  selectedSupplier.trucks.length > 0 ? (
                    selectedSupplier.trucks.map((t: any) => (
                      // FIX: Explicitly showing Number FIRST, then Type
                      <option key={t.id} value={t.id}>
                        🚛 {t.vehicleNumber.toUpperCase()} — {t.truckType}
                      </option>
                    ))
                  ) : (
                    <option disabled>No approved trucks available</option>
                  )}
                </select>
              </div>

              {/* 3. DRIVER DETAILS */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Driver Name
                </label>
                <Input
                  name="driverName"
                  placeholder="e.g. Raju Kumar"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Driver Phone
                </label>
                <Input name="driverPhone" placeholder="98XXXXXXXX" required />
              </div>

              {/* 4. RATES */}
              <div className="bg-brand-cream/50 p-4 rounded-xl border border-brand-highlight">
                <label className="text-[10px] font-bold text-gray-400 uppercase">
                  Customer Rate (Fixed)
                </label>
                <div className="text-xl font-black text-slate-700">
                  ₹ {order.rate.toLocaleString()}
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                <label className="text-[10px] font-bold text-green-700 uppercase">
                  Supplier Rate (Cost)
                </label>
                <Input
                  name="supplierRate"
                  type="number"
                  placeholder="e.g. 40000"
                  className="bg-white border-green-300 focus:ring-green-500"
                  required
                />
              </div>

              {/* Footer */}
              <div className="col-span-2 flex justify-end gap-3 mt-4 pt-4 border-t">
                <Button type="button" variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold w-full md:w-auto"
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    "Confirm & Create Shipment"
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
