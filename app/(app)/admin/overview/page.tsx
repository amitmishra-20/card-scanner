"use client";

import { useEffect, useState } from "react";
import { Users, ScanLine, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getAdminDashboardData } from "@/actions/admin";

interface AdminStats {
  totalUsers: number;
  totalScans: number;
  totalWaitlist: number;
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getAdminDashboardData();
        if (res.success && res.data) {
          setStats(res.data as AdminStats);
        } else {
          setError(res.error || "Failed to load admin data");
        }
      } catch {
        setError("Failed to load admin data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="glass">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-9 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] text-center">
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-3">
      <Card className="glass">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Users
          </CardTitle>
          <div className="p-2 bg-primary/10 rounded-lg">
            <Users className="w-4 h-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-foreground">
            {stats?.totalUsers ?? 0}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Registered accounts
          </p>
        </CardContent>
      </Card>

      <Card className="glass">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Scans
          </CardTitle>
          <div className="p-2 bg-pink-500/10 rounded-lg">
            <ScanLine className="w-4 h-4 text-pink-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-foreground">
            {stats?.totalScans ?? 0}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Across all users
          </p>
        </CardContent>
      </Card>

      <Card className="glass">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Waitlist Signups
          </CardTitle>
          <div className="p-2 bg-amber-500/10 rounded-lg">
            <Mail className="w-4 h-4 text-amber-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-foreground">
            {stats?.totalWaitlist ?? 0}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            People on waitlist
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
