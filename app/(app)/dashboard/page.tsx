"use client";

import { useEffect, useState } from "react";
import {
  Users,
  UserPlus,
  ScanLine,
  TrendingUp,
  ArrowRight,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getDashboardData } from "@/actions/leads";
import type { DashboardStats, LeadStatus } from "@/types";
import { LEAD_STATUS_CONFIG } from "@/constants";
import dynamic from "next/dynamic";

const DashboardChart = dynamic(
  () =>
    import("@/components/dashboard-chart").then((mod) => mod.DashboardChart),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[250px] w-full rounded-xl" />,
  }
);

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getDashboardData();
        if (res.success && res.data) {
          setStats(res.data as DashboardStats);
        } else {
          setError(res.error || "Failed to load dashboard data");
        }
      } catch {
        setError("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-center">
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Overview of your card scans and lead pipeline.
        </p>
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Leads
            </CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="w-4 h-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {stats?.totalLeads || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              +{stats?.newLeadsThisMonth || 0} this month
            </p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Conversion Rate
            </CardTitle>
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {stats?.conversionRate || 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Of all leads captured
            </p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Scans Used
            </CardTitle>
            <div className="p-2 bg-pink-500/10 rounded-lg">
              <ScanLine className="w-4 h-4 text-pink-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {stats?.scansThisMonth || 0}
              <span className="text-lg text-muted-foreground font-normal">
                /{stats?.scanLimit === -1 ? "∞" : stats?.scanLimit}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Renews next month
            </p>
          </CardContent>
        </Card>

        <Card className="glass relative overflow-hidden group">
          <div className="absolute inset-0 bg-linear-to-br from-primary/10 to-primary/5 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-foreground">
              Scan a Card
            </CardTitle>
            <div className="p-2 bg-background/50 rounded-lg">
              <UserPlus className="w-4 h-4 text-foreground" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <Button className="w-full btn-gradient shadow-lg">
              <Link href="/scan" className="flex items-center">
                <ScanLine className="w-4 h-4 mr-2" />
                Start Scanner
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Leads Over Time Chart */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Leads Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.leadsOverTime?.length ? (
              <DashboardChart data={stats.leadsOverTime} />
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                <p className="text-sm">
                  No data yet. Scan some cards to see trends.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Leads by Status */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Pipeline Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.leadsByStatus?.length ? (
                stats.leadsByStatus.map((item) => {
                  const config =
                    LEAD_STATUS_CONFIG[item.status as LeadStatus];
                  const percentage = Math.round(
                    (item.count / (stats.totalLeads || 1)) * 100
                  );

                  return (
                    <div key={item.status} className="flex items-center gap-4">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: config.color }}
                      />
                      <div className="flex-1 flex justify-between items-center text-sm">
                        <span className="font-medium text-muted-foreground">
                          {config.label}
                        </span>
                        <span className="font-mono text-foreground">
                          {item.count} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-1000"
                          style={{
                            backgroundColor: config.color,
                            width: `${percentage}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No leads in pipeline yet.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Leads */}
        <Card className="glass flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle>Recent Leads</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary hover:text-primary/80"
            >
              <Link href="/leads" className="flex items-center">
                View All <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-6">
              {stats?.recentLeads?.length ? (
                stats.recentLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <span className="font-medium text-foreground">
                          {lead.name?.charAt(0).toUpperCase() || "?"}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {lead.name || "Unknown"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {lead.designation}{" "}
                          {lead.company ? `at ${lead.company}` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${LEAD_STATUS_CONFIG[lead.status as LeadStatus].bgClass} ${LEAD_STATUS_CONFIG[lead.status as LeadStatus].textClass}`}
                      >
                        {LEAD_STATUS_CONFIG[lead.status as LeadStatus].label}
                      </span>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                    <Users className="w-5 h-5 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm text-foreground font-medium mb-1">
                    No leads found
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Scan a business card to get started
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="h-9 w-48 mb-2" />
        <Skeleton className="h-5 w-72" />
      </div>
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
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
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Skeleton className="h-75 rounded-xl glass" />
        <Skeleton className="h-75 rounded-xl glass" />
      </div>
    </div>
  );
}
