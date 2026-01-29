"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { createOfficeAction } from "@/actions/office-actions";
import { Building2, PlusCircle } from "lucide-react";

export default function CreateOfficeModal({ zones }: { zones: any[] }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {/* BUTTON: Dark Blue to match App Theme */}
        <Button className="bg-brand-dark hover:bg-slate-800 text-white gap-2 shadow-lg shadow-slate-200">
          <Building2 className="h-4 w-4 text-orange-400" />
          Add New Branch
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px] bg-white rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-brand-dark flex items-center gap-2">
            <PlusCircle className="text-brand-primary h-6 w-6" />
            Open New Office
          </DialogTitle>
        </DialogHeader>

        <form 
          action={async (formData) => {
            await createOfficeAction(formData);
            setOpen(false);
          }} 
          className="space-y-4 py-4"
        >
          <div className="space-y-2">
             <label className="text-xs font-bold text-slate-500 uppercase">Office / Branch Name</label>
             <Input name="name" placeholder="e.g. Okhla Hub" required className="bg-slate-50 border-slate-200 focus:border-brand-primary" />
          </div>

          <div className="space-y-2">
             <label className="text-xs font-bold text-slate-500 uppercase">City Location</label>
             <Input name="city" placeholder="e.g. New Delhi" required className="bg-slate-50 border-slate-200 focus:border-brand-primary" />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Assign Zone</label>
            <select 
              name="zoneId" 
              className="w-full p-2.5 rounded-md bg-slate-50 border border-slate-200 text-sm font-medium focus:outline-none focus:border-brand-primary"
              required
              defaultValue=""
            >
              <option value="" disabled>Select a Zone...</option>
              {zones.map((z) => (
                <option key={z.id} value={z.id}>{z.name}</option>
              ))}
            </select>
          </div>

          {/* SUBMIT: Orange Action Button */}
          <Button type="submit" className="w-full bg-brand-primary hover:bg-orange-700 h-11 text-base font-bold mt-2 text-white">
            Confirm & Create Office
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}