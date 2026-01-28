"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Truck, Lock, Loader2, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // 1. Attempt Login
    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      setError("Invalid Email or Password");
      setLoading(false);
    } else {
      // 2. SECURITY SUCCESS: Set the Tab Flag
      // This flag proves this specific tab was used to log in.
      sessionStorage.setItem("RLS_SESSION_ACTIVE", "true");
      
      // 3. Redirect to Dashboard
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
         <div className="absolute right-0 top-0 bg-brand-primary w-[500px] h-[500px] rounded-full blur-[120px]"></div>
         <div className="absolute left-0 bottom-0 bg-brand-secondary w-[500px] h-[500px] rounded-full blur-[120px]"></div>
      </div>

      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm border-0 shadow-2xl z-10">
        <CardContent className="p-8">
          
          {/* Logo Header */}
          <div className="text-center mb-8">
            <div className="bg-brand-primary w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-primary/30">
              <Truck className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">RELOAD LOGISTICS</h1>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Secure Employee Access</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-600 font-medium animate-in fade-in slide-in-from-top-2">
                <ShieldCheck className="h-4 w-4" /> {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="relative">
                <div className="absolute left-3 top-3 text-gray-400"><Lock className="h-5 w-5" /></div>
                <Input 
                  type="email" 
                  placeholder="Official Email ID" 
                  className="pl-10 h-12 bg-gray-50 border-gray-200 focus:border-brand-primary focus:ring-brand-primary/20 transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="off" // Disable browser suggestions
                />
              </div>

              <div className="relative">
                 <div className="absolute left-3 top-3 text-gray-400"><ShieldCheck className="h-5 w-5" /></div>
                 <Input 
                  type="password" 
                  placeholder="Password" 
                  className="pl-10 h-12 bg-gray-50 border-gray-200 focus:border-brand-primary focus:ring-brand-primary/20 transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password" // Stronger suggestion disable
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-brand-primary hover:bg-brand-secondary text-white font-bold text-lg shadow-lg shadow-brand-primary/30 transition-all active:scale-95"
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin" /> : "Secure Login"}
            </Button>

            <div className="text-center">
              <p className="text-[10px] text-gray-400">
                Unauthorized access is prohibited. <br/>
                Your IP address is being monitored.
              </p>
            </div>

          </form>
        </CardContent>
      </Card>

    </div>
  );
}