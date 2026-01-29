"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { createUserAction } from "@/actions/user-actions";
import { PlusCircle, UserPlus } from "lucide-react";

export default function CreateUserModal({ currentUser, offices }: { currentUser: any, offices: any[] }) {
  const [open, setOpen] = useState(false);
  const isSuperAdmin = currentUser.role === "SUPER_ADMIN";
  const canAssignOffice = isSuperAdmin || currentUser.role === "DEPT_HEAD";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {/* BUTTON: Dark Blue to match App */}
        <Button className="bg-brand-dark hover:bg-slate-800 text-white gap-2 shadow-lg shadow-slate-200">
          <UserPlus className="h-4 w-4 text-orange-400" />
          Add New Member
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px] bg-white rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-brand-dark flex items-center gap-2">
            <PlusCircle className="text-brand-primary h-6 w-6" />
            Hire New Staff
          </DialogTitle>
        </DialogHeader>

        <form 
          action={async (formData) => {
            await createUserAction(formData);
            setOpen(false);
          }} 
          className="space-y-4 py-4"
        >
          {/* Inputs styled with Slate borders */}
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
               <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
               <Input name="name" placeholder="e.g. Rahul Sharma" required className="bg-slate-50 border-slate-200 focus:border-brand-primary" />
             </div>
             <div className="space-y-2">
               <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
               <Input name="email" type="email" placeholder="rahul@rls.com" required className="bg-slate-50 border-slate-200 focus:border-brand-primary" />
             </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Password</label>
            <Input name="password" type="password" required className="bg-slate-50 border-slate-200 focus:border-brand-primary" />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Role</label>
                <select name="role" className="w-full p-2.5 rounded-md bg-slate-50 border border-slate-200 text-sm font-medium focus:outline-none focus:border-brand-primary" required defaultValue="">
                  <option value="" disabled>Select Role...</option>
                  {isSuperAdmin && (
                    <>
                      <option value="DEPT_HEAD">⭐ Dept. Head</option>
                      <option value="ZONAL_MANAGER">Zonal Manager</option>
                      <option value="REGION_MANAGER">Region Manager</option>
                      <option value="OFFICE_MANAGER">Office Manager</option>
                      <option value="SUPERVISOR">Supervisor</option>
                      <option value="EMPLOYEE">Employee</option>
                      <option value="VERIFIER">Verifier</option>
                    </>
                  )}
                  {!isSuperAdmin && currentUser.department === "OPERATIONS" && (
                    <>
                      <option value="ZONAL_MANAGER">Zone Manager</option>
                      <option value="REGION_MANAGER">Region Manager</option>
                      <option value="OFFICE_MANAGER">Office Manager</option>
                      <option value="SUPERVISOR">Supervisor</option>
                      <option value="EMPLOYEE">Employee</option>
                    </>
                  )}
                </select>
             </div>

             <div className="space-y-2">
               <label className="text-xs font-bold text-slate-500 uppercase">Department</label>
               {isSuperAdmin ? (
                  <select name="department" className="w-full p-2.5 rounded-md bg-slate-50 border border-slate-200 text-sm font-medium focus:outline-none focus:border-brand-primary" required>
                    <option value="OPERATIONS">Operations</option>
                    <option value="HR">HR</option>
                    <option value="ACCOUNTS">Accounts</option>
                    <option value="IT">IT</option>
                    <option value="PARTNER_HELP_DESK">Help Desk</option>
                  </select>
               ) : (
                  <input type="hidden" name="department" value={currentUser.department} />
               )}
               {!isSuperAdmin && <div className="p-2.5 bg-slate-100 rounded text-sm text-slate-500 font-bold">{currentUser.department}</div>}
             </div>
          </div>

          {canAssignOffice ? (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Assign Office</label>
              <select name="officeId" className="w-full p-2.5 rounded-md bg-slate-50 border border-slate-200 text-sm font-medium focus:outline-none focus:border-brand-primary">
                <option value="">🏢 Headquarters / Roaming</option>
                {offices.map((office) => (
                  <option key={office.id} value={office.id}>
                    {office.name} ({office.city})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <input type="hidden" name="officeId" value={currentUser.officeId || ""} />
          )}

          {/* SUBMIT BUTTON: Orange to stand out */}
          <Button type="submit" className="w-full bg-brand-primary hover:bg-orange-700 h-11 text-base font-bold mt-2 text-white">
            Confirm & Add Member
          </Button>

        </form>
      </DialogContent>
    </Dialog>
  );
}