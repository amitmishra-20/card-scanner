"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Shield,
  Clock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getAdminUsersAction } from "@/actions/admin";
import type { UserWithStats } from "@/types";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = useCallback(async (search = "", p = 1) => {
    setIsLoading(true);
    try {
      const res = await getAdminUsersAction({ search, page: p });
      if (res.success && res.data) {
        setUsers(res.data.users as UserWithStats[]);
        setTotalPages(res.data.totalPages);
      } else {
        toast.error(res.error || "Failed to load users");
      }
    } catch {
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers(searchQuery, 1);
  };

  return (
    <div className="space-y-6">
      <Card className="glass border-border/50">
        <div className="p-4 border-b border-border/50 bg-card/50">
          <form onSubmit={handleSearch} className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
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
                  <th className="px-6 py-4 font-medium">User</th>
                  <th className="px-6 py-4 font-medium hidden sm:table-cell">
                    Plan
                  </th>
                  <th className="px-6 py-4 font-medium hidden md:table-cell">
                    Total Scans
                  </th>
                  <th className="px-6 py-4 font-medium hidden lg:table-cell">
                    Last Scanned
                  </th>
                  <th className="px-6 py-4 font-medium hidden md:table-cell">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {isLoading
                  ? [...Array(5)].map((_, i) => (
                      <tr key={i} className="bg-card/30">
                        <td className="px-6 py-4">
                          <Skeleton className="h-10 w-32" />
                        </td>
                        <td className="px-6 py-4 hidden sm:table-cell">
                          <Skeleton className="h-6 w-16 rounded-full" />
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          <Skeleton className="h-5 w-12" />
                        </td>
                        <td className="px-6 py-4 hidden lg:table-cell">
                          <Skeleton className="h-5 w-32" />
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          <Skeleton className="h-5 w-24" />
                        </td>
                      </tr>
                    ))
                  : users.length === 0
                    ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-6 py-12 text-center text-muted-foreground"
                          >
                            <div className="flex flex-col items-center justify-center">
                              <Search className="w-8 h-8 mb-3 opacity-20" />
                              <p>No users found.</p>
                            </div>
                          </td>
                        </tr>
                      )
                      : users.map((user) => (
                          <tr
                            key={user.id}
                            className="hover:bg-muted/20 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium shrink-0 overflow-hidden">
                                  {user.image ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                      src={user.image}
                                      alt=""
                                      className="w-9 h-9 rounded-full object-cover"
                                    />
                                  ) : (
                                    user.name?.charAt(0).toUpperCase() || "?"
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-medium text-foreground truncate max-w-48 flex items-center gap-1.5">
                                    {user.name || "Unknown"}
                                    {user.role === "ADMIN" && (
                                      <Shield className="w-3.5 h-3.5 text-primary shrink-0" />
                                    )}
                                  </div>
                                  <div className="text-xs text-muted-foreground truncate max-w-48">
                                    {user.email}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 hidden sm:table-cell">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  user.plan === "FREE"
                                    ? "bg-muted text-muted-foreground"
                                    : user.plan === "PRO"
                                      ? "bg-primary/15 text-primary"
                                      : "bg-amber-500/15 text-amber-400"
                                }`}
                              >
                                {user.plan}
                              </span>
                            </td>
                            <td className="px-6 py-4 hidden md:table-cell">
                              <span className="font-mono text-foreground">
                                {user.totalScans}
                              </span>
                            </td>
                            <td className="px-6 py-4 hidden lg:table-cell">
                              {user.lastScannedLead ? (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Clock className="w-3.5 h-3.5 shrink-0" />
                                  <span className="truncate max-w-40">
                                    {user.lastScannedLead.name || "Unknown"}
                                    {user.lastScannedLead.company
                                      ? ` at ${user.lastScannedLead.company}`
                                      : ""}
                                    {" — "}
                                    {new Date(
                                      user.lastScannedLead.createdAt
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground/50">
                                  Never
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 hidden md:table-cell">
                              <span className="text-muted-foreground">
                                {new Date(
                                  user.createdAt
                                ).toLocaleDateString()}
                              </span>
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
                    fetchUsers(searchQuery, next);
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
                    fetchUsers(searchQuery, next);
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
