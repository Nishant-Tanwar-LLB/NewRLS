"use client";

import { useState } from "react";
import { createOrderAction } from "@/actions/order-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, Loader2 } from "lucide-react";

export default function CreateOrderModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Wrapper to handle closing the modal after submission
  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    await createOrderAction(formData);
    setIsSubmitting(false);
    setIsOpen(false); // Close modal on success
  }

  return (
    <>
      {/* 1. THE TRIGGER BUTTON (Top Right) */}
      <Button 
        onClick={() => setIsOpen(true)}
        className="bg-brand-primary hover:bg-brand-secondary text-white font-bold shadow-md transition-all active:scale-95"
      >
        <Plus className="mr-2 h-4 w-4" /> Create New Order
      </Button>

      {/* 2. THE MODAL OVERLAY */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          
          {/* 3. THE MODAL BOX */}
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 border border-brand-highlight">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-brand-cream/30">
              <div>
                <h2 className="text-2xl font-black text-brand-primary">New Shipment</h2>
                <p className="text-xs text-gray-500">Fill in the details below</p>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-red-100 hover:text-red-500 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body (The Form) */}
            <div className="p-8">
              <form action={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="col-span-1 md:col-span-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Customer Name</label>
                  <Input name="customerName" placeholder="e.g. Tata Steel Ltd" required className="border-gray-200 focus:border-brand-primary" />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">From (Pickup)</label>
                  <Input name="fromLocation" placeholder="City/State" required />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">To (Drop)</label>
                  <Input name="toLocation" placeholder="City/State" required />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Material</label>
                  <Input name="material" placeholder="e.g. Iron Rods" required />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Weight</label>
                  <Input name="weight" placeholder="e.g. 20 Tons" required />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Truck Size</label>
                  <select name="truckSize" className="w-full h-10 px-3 border rounded-md text-sm bg-background focus:ring-2 focus:ring-brand-primary/20 outline-none" required defaultValue="Open Body">
                    <option value="Open Body">Open Body</option>
                    <option value="Container">Container</option>
                    <option value="Trailer">Trailer</option>
                    <option value="10 Wheeler">10 Wheeler</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Rate (₹)</label>
                  <Input name="rate" type="number" placeholder="45000" required />
                </div>

                {/* Footer Actions */}
                <div className="col-span-1 md:col-span-2 flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => setIsOpen(false)}
                    className="text-gray-500 hover:text-gray-800"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="bg-brand-primary hover:bg-brand-secondary text-white font-bold px-8"
                  >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Booking"}
                  </Button>
                </div>

              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}