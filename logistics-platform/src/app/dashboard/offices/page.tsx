import { PrismaClient } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createOfficeAction } from "@/actions/office-actions"; // We will make this next

const prisma = new PrismaClient();

export default async function OfficePage() {
  // 1. Fetch Data
  const offices = await prisma.office.findMany({
    include: { zone: true, staff: true } // Get Zone name and Staff count
  });
  
  const zones = await prisma.zone.findMany();

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">🏢 Office Management</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* --- LEFT: FORM TO ADD NEW OFFICE --- */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Add New Office</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createOfficeAction} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Office Name</label>
                <Input name="name" placeholder="e.g. Okhla Branch" required />
              </div>
              
              <div>
                <label className="text-sm font-medium">City</label>
                <Input name="city" placeholder="e.g. New Delhi" required />
              </div>

              <div>
                <label className="text-sm font-medium">Zone</label>
                <select 
                  name="zoneId" 
                  className="w-full p-2 border rounded-md bg-background"
                  required
                >
                  <option value="">Select a Zone</option>
                  {zones.map((z) => (
                    <option key={z.id} value={z.id}>{z.name}</option>
                  ))}
                </select>
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                Create Office
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* --- RIGHT: LIST OF OFFICES --- */}
        <div className="md:col-span-2 grid grid-cols-1 gap-4">
          {offices.map((office) => (
            <Card key={office.id} className="flex justify-between items-center p-6">
              <div>
                <h3 className="font-bold text-lg">{office.name}</h3>
                <p className="text-sm text-gray-500">📍 {office.city} • {office.zone.name}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{office.staff.length}</p>
                <p className="text-xs text-gray-400">Employees</p>
              </div>
            </Card>
          ))}
          
          {offices.length === 0 && (
            <div className="text-center p-10 border-2 border-dashed rounded-lg text-gray-400">
              No offices found. Create one on the left! 👈
            </div>
          )}
        </div>

      </div>
    </div>
  );
}