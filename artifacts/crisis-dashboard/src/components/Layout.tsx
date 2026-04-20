import React from "react";
import { Link, useLocation } from "wouter";
import { ShieldAlert, Settings, Activity } from "lucide-react";
import { useHealthCheck, getHealthCheckQueryKey } from "@workspace/api-client-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { data: health } = useHealthCheck({ query: { queryKey: getHealthCheckQueryKey() } });

  const isUp = health?.status === "ok";

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground dark">
      <header className="h-14 border-b border-border bg-card flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 font-bold text-lg tracking-tight">
            <ShieldAlert className="w-5 h-5 text-primary" />
            <span>CRISIS<span className="text-muted-foreground font-normal">DASH</span></span>
          </div>
          
          <nav className="flex items-center gap-1">
            <Link href="/" className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${location === "/" ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"}`}>
              Dashboard
            </Link>
            <Link href="/accounts" className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${location === "/accounts" ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"}`}>
              <span className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </span>
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
            <Activity className="w-3.5 h-3.5" />
            SYS: {isUp ? <span className="text-green-500">ONLINE</span> : <span className="text-destructive">OFFLINE</span>}
          </div>
        </div>
      </header>
      
      <main className="flex-1 overflow-hidden relative flex flex-col">
        {children}
      </main>
    </div>
  );
}
