"use client";
import { useState, useEffect } from "react";

export default function AdminDashboard() {
  const [tab, setTab] = useState<"LIVE" | "HISTORY">("LIVE");
  
  const [loads, setLoads] = useState<any[]>([]);
  const [historyLoads, setHistoryLoads] = useState<any[]>([]); // New History State
  const [pendingTrucks, setPendingTrucks] = useState<any[]>([]);
  const [bids, setBids] = useState<any[]>([]); 

  // FORM STATE
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [price, setPrice] = useState("");
  const [weight, setWeight] = useState("");

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    // 1. Get Live Loads
    const res1 = await fetch("/api/mobile", { method: "POST", body: JSON.stringify({ action: "GET_LOADS" }) });
    const data1 = await res1.json();
    if (data1.success) setLoads(data1.loads);

    // 2. Get Pending Trucks
    const res2 = await fetch("/api/mobile", { method: "POST", body: JSON.stringify({ action: "GET_PENDING_TRUCKS" }) });
    const data2 = await res2.json();
    if (data2.success) setPendingTrucks(data2.trucks);

    // 3. Get Live Bids
    const res3 = await fetch("/api/mobile", { method: "POST", body: JSON.stringify({ action: "GET_ALL_BIDS" }) });
    const data3 = await res3.json();
    if (data3.success) setBids(data3.bids);

    // 4. Get History (NEW)
    const res4 = await fetch("/api/mobile", { method: "POST", body: JSON.stringify({ action: "GET_HISTORY" }) });
    const data4 = await res4.json();
    if (data4.success) setHistoryLoads(data4.history);
  };

  const createOrder = async () => {
    if (!from || !to || !price) return alert("Fill all fields");
    const res = await fetch("/api/mobile", {
      method: "POST",
      body: JSON.stringify({ action: "CREATE_ORDER", from, to, price, weight, material: "General Goods" }),
    });
    const data = await res.json();
    if (data.success) {
      alert("Order Created! 🚛");
      setFrom(""); setTo(""); setPrice(""); setWeight("");
      fetchData();
    }
  };

  const approveTruck = async (truckId: string) => {
    const res = await fetch("/api/mobile", { method: "POST", body: JSON.stringify({ action: "APPROVE_TRUCK", truckId }) });
    if ((await res.json()).success) { alert("Approved! ✅"); fetchData(); }
  };

  const acceptBid = async (orderId: string, bidId: string) => {
    if(!confirm("Assign load to this driver?")) return;
    const res = await fetch("/api/mobile", { method: "POST", body: JSON.stringify({ action: "ACCEPT_BID", orderId, bidId }) });
    if ((await res.json()).success) { alert("Load Assigned! 🚚"); fetchData(); }
  };

  // --- NEW FUNCTIONS ---
  const stopBidding = async (orderId: string) => {
    if(!confirm("Stop bidding? This will move the order to History.")) return;
    const res = await fetch("/api/mobile", { method: "POST", body: JSON.stringify({ action: "STOP_BIDDING", orderId }) });
    if ((await res.json()).success) fetchData();
  };

  const repostOrder = async (orderId: string) => {
    if(!confirm("Repost this order? It will go live again.")) return;
    const res = await fetch("/api/mobile", { method: "POST", body: JSON.stringify({ action: "REPOST_ORDER", orderId }) });
    if ((await res.json()).success) { alert("Order is Live Again! 🔄"); fetchData(); }
  };
  // --------------------

  return (
    <div className="min-h-screen bg-slate-100 p-10 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Operations Control</h1>
          
          {/* TABS */}
          <div className="bg-white p-1 rounded-lg border border-slate-300 flex">
            <button onClick={() => setTab("LIVE")} className={`px-4 py-2 rounded-md font-bold text-sm ${tab==="LIVE" ? "bg-slate-900 text-white" : "text-slate-500"}`}>LIVE OPS</button>
            <button onClick={() => setTab("HISTORY")} className={`px-4 py-2 rounded-md font-bold text-sm ${tab==="HISTORY" ? "bg-slate-900 text-white" : "text-slate-500"}`}>HISTORY</button>
          </div>
        </div>

        {/* --- TAB 1: LIVE OPERATIONS --- */}
        {tab === "LIVE" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* CREATE LOAD */}
            <div>
              <div className="bg-white p-6 rounded-2xl shadow-sm mb-6 border border-slate-200">
                <h2 className="text-xl font-bold text-slate-800 mb-4">Publish New Load</h2>
                <div className="grid grid-cols-2 gap-4">
                  <input placeholder="From" className="p-3 border rounded-lg bg-slate-50" value={from} onChange={e => setFrom(e.target.value)} />
                  <input placeholder="To" className="p-3 border rounded-lg bg-slate-50" value={to} onChange={e => setTo(e.target.value)} />
                  <input placeholder="Price" type="number" className="p-3 border rounded-lg bg-slate-50" value={price} onChange={e => setPrice(e.target.value)} />
                  <input placeholder="Weight" type="number" className="p-3 border rounded-lg bg-slate-50" value={weight} onChange={e => setWeight(e.target.value)} />
                </div>
                <button onClick={createOrder} className="mt-4 w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition">Publish Load</button>
              </div>

              {/* LIVE LOADS LIST */}
              <h2 className="text-xl font-bold text-slate-800 mb-4">Active Loads</h2>
              <div className="space-y-4">
                {loads.map((load) => (
                  <div key={load.id} className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center shadow-sm">
                    <div>
                      <h3 className="font-bold text-slate-800">{load.from} ➝ {load.to}</h3>
                      <p className="text-sm text-slate-500">{load.weight} • {load.type}</p>
                      <p className="text-xs font-bold text-green-600 mt-1">{load.price}</p>
                    </div>
                    {/* STOP BUTTON */}
                    <button onClick={() => stopBidding(load.id)} className="bg-red-100 text-red-700 px-3 py-1 rounded-lg text-xs font-bold hover:bg-red-200">
                      STOP 🛑
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT: APPROVALS & BIDS */}
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-4">Pending Approvals</h2>
              <div className="space-y-4 mb-10">
                {pendingTrucks.length === 0 && <p className="text-slate-400">No pending trucks.</p>}
                {pendingTrucks.map((truck) => (
                  <div key={truck.id} className="bg-white p-4 rounded-xl border-l-4 border-orange-500 shadow-sm flex justify-between items-center">
                    <div>
                       <h3 className="font-bold">{truck.number}</h3>
                       <p className="text-xs text-slate-500">{truck.owner.fullName}</p>
                    </div>
                    <button onClick={() => approveTruck(truck.id)} className="bg-green-600 text-white px-3 py-1 rounded text-sm font-bold">Approve</button>
                  </div>
                ))}
              </div>

              <h2 className="text-xl font-bold text-slate-800 mb-4">Live Bids Received</h2>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr><th className="p-3">Route</th><th className="p-3">Bidder</th><th className="p-3">Bid</th><th className="p-3">Action</th></tr>
                  </thead>
                  <tbody>
                    {bids.map((bid) => (
                      <tr key={bid.id} className="border-b border-slate-100">
                        <td className="p-3 font-medium">{bid.load.from}</td>
                        <td className="p-3">{bid.truckOwner.fullName}</td>
                        <td className="p-3 font-bold text-blue-600">₹{bid.amount}</td>
                        <td className="p-3">
                          <button onClick={() => acceptBid(bid.load.id, bid.id)} className="bg-slate-900 text-white px-2 py-1 rounded text-xs">ACCEPT</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 2: HISTORY (NEW) --- */}
        {tab === "HISTORY" && (
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Order History (Stopped / Assigned)</h2>
            <div className="grid grid-cols-1 gap-4">
               {historyLoads.map((load) => (
                 <div key={load.id} className="bg-white p-5 rounded-xl border border-slate-200 flex justify-between items-center shadow-sm opacity-80 hover:opacity-100 transition">
                    <div className="flex gap-4 items-center">
                       <div className={`p-3 rounded-full ${load.status === 'ASSIGNED' ? 'bg-green-100' : 'bg-red-100'}`}>
                          {load.status === 'ASSIGNED' ? '✅' : '🛑'}
                       </div>
                       <div>
                          <h3 className="font-bold text-lg text-slate-800">{load.fromLocation} ➝ {load.toLocation}</h3>
                          <p className="text-sm text-slate-500">
                             Status: <span className="font-bold">{load.status}</span> • Bids Received: {load.bids.length}
                          </p>
                       </div>
                    </div>
                    
                    {/* REPOST BUTTON */}
                    {load.status !== 'ASSIGNED' && (
                       <button 
                         onClick={() => repostOrder(load.id)}
                         className="bg-blue-600 text-white px-5 py-2 rounded-lg font-bold hover:bg-blue-700 shadow-md flex items-center gap-2"
                       >
                         🔄 REPOST
                       </button>
                    )}
                 </div>
               ))}
               {historyLoads.length === 0 && <p className="text-slate-400">No history yet.</p>}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}