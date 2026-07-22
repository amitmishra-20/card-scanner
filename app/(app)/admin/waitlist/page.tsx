"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Mail,
  Clock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getAdminWaitlistAction } from "@/actions/admin";
import type { WaitlistEntry } from "@/types";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminWaitlistPage() {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchEntries = useCallback(async (search = "", p = 1) => {
    setIsLoading(true);
    try {
      const res = await getAdminWaitlistAction({ search, page: p });
      if (res.success && res.data) {
        setEntries(res.data.entries as WaitlistEntry[]);
        setTotalPages(res.data.totalPages);
      } else {
        toast.error(res.error || "Failed to load waitlist");
      }
    } catch {
      toast.error("Failed to load waitlist");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchEntries(searchQuery, 1);
  };

  return (
    <div className="space-y-6">
      <Card className="glass border-border/50">
        <div className="p-4 border-b border-border/50 bg-card/50">
          <form onSubmit={handleSearch} className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by email..."
              className="pl-9 bg-background"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/30">
                <tr>
                  <th className="px-6 py-4 font-medium">Email</th>
                  <th className="px-6 py-4 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {isLoading
                  ? [...Array(5)].map((_, i) => (
                      <tr key={i} className="bg-card/30">
                        <td className="px-6 py-4">
                          <Skeleton className="h-5 w-48" />
                        </td>
                        <td className="px-6 py-4">
                          <Skeleton className="h-5 w-24" />
                        </td>
                      </tr>
                    ))
                  : entries.length === 0
                    ? (
                        <tr>
                          <td
                            colSpan={2}
                            className="px-6 py-12 text-center text-muted-foreground"
                          >
                            <div className="flex flex-col items-center justify-center">
                              <Mail className="w-8 h-8 mb-3 opacity-20" />
                              <p>No waitlist entries found.</p>
                            </div>
                          </td>
                        </tr>
                      )
                      : entries.map((entry) => (
                          <tr
                            key={entry.id}
                            className="hover:bg-muted/20 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 font-medium shrink-0">
                                  <Mail className="w-4 h-4" />
                                </div>
                                <span className="font-medium text-foreground truncate max-w-64">
                                  {entry.email}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock className="w-3.5 h-3.5" />
                                <span>
                                  {new Date(
                                    entry.createdAt
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-border/50">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => {
                    const next = page - 1;
                    setPage(next);
                    fetchEntries(searchQuery, next);
                  }}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => {
                    const next = page + 1;
                    setPage(next);
                    fetchEntries(searchQuery, next);
                  }}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
