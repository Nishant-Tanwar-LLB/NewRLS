import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HrDashboard({ user }: { user: any }) {
  return (
    <div className="space-y-6">
      <div className="bg-pink-700 text-white p-8 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold">🤝 HR Department</h1>
        <p className="opacity-80">Staff Management</p>
      </div>
      <div className="p-10 text-center border-2 border-dashed rounded-xl text-gray-400">
        HR Features Coming Soon...
      </div>
    </div>
  );
}