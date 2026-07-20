"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Users,
  Search,
  Mail,
  Phone,
  Building,
  Trash2,
  Pencil,
  ChevronLeft,
  ChevronRight,
  Download,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  getLeads,
  deleteLeadAction,
  updateLead,
} from "@/actions/leads";
import { LEAD_STATUS_CONFIG } from "@/constants";
import type { Lead, LeadStatus } from "@/types";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const LeadDeleteDialog = dynamic(
  () =>
    import("@/components/leads/lead-delete-dialog").then(
      (m) => m.LeadDeleteDialog
    ),
  { ssr: false }
);
const LeadEditDialog = dynamic(
  () =>
    import("@/components/leads/lead-edit-dialog").then(
      (m) => m.LeadEditDialog
    ),
  { ssr: false }
);

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<LeadStatus | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    designation: "",
    company: "",
    emails: "",
    phones: "",
    websites: "",
    address: "",
    notes: "",
    status: "NEW" as LeadStatus,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [deletingLeadId, setDeletingLeadId] = useState<string | null>(null);

  const fetchLeads = useCallback(
    async (search = "", status?: LeadStatus | null, p = 1) => {
      setIsLoading(true);
      try {
        const res = await getLeads({
          search,
          status: status as LeadStatus | undefined,
          page: p,
        });
        if (res.success && res.data) {
          setLeads(res.data.leads as Lead[]);
          setTotalPages(res.data.totalPages);
        } else {
          toast.error(res.error || "Failed to load leads");
        }
      } catch {
        toast.error("Failed to load leads");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLeads(searchQuery, activeFilter, 1);
  };

  const handleFilter = (status: LeadStatus | null) => {
    setActiveFilter(status);
    setPage(1);
    fetchLeads(searchQuery, status, 1);
  };

  const handleDelete = async (id: string) => {
    setDeletingLeadId(null);
    try {
      const res = await deleteLeadAction(id);
      if (res.success) {
        toast.success("Lead deleted");
        setLeads((prev) => prev.filter((l) => l.id !== id));
      } else {
        toast.error(res.error || "Failed to delete lead");
      }
    } catch {
      toast.error("Failed to delete lead");
    }
  };

  const openEditDialog = (lead: Lead) => {
    setEditingLead(lead);
    setEditForm({
      name: lead.name || "",
      designation: lead.designation || "",
      company: lead.company || "",
      emails: lead.emails.join(", "),
      phones: lead.phones.join(", "),
      websites: lead.websites.join(", "),
      address: lead.address || "",
      notes: lead.notes || "",
      status: lead.status,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingLead) return;
    setIsSaving(true);
    try {
      const res = await updateLead({
        id: editingLead.id,
        name: editForm.name || null,
        designation: editForm.designation || null,
        company: editForm.company || null,
        emails: editForm.emails
          .split(",")
          .map((e) => e.trim())
          .filter(Boolean),
        phones: editForm.phones
          .split(",")
          .map((p) => p.trim())
          .filter(Boolean),
        websites: editForm.websites
          .split(",")
          .map((w) => w.trim())
          .filter(Boolean),
        address: editForm.address || null,
        notes: editForm.notes || null,
        status: editForm.status,
      });
      if (res.success) {
        toast.success("Lead updated");
        setEditingLead(null);
        fetchLeads(searchQuery, activeFilter, page);
      } else {
        toast.error(res.error || "Failed to update lead");
      }
    } catch {
      toast.error("Failed to update lead");
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportCSV = () => {
    if (leads.length === 0) {
      toast.error("No leads to export");
      return;
    }
    const headers = [
      "Name",
      "Designation",
      "Company",
      "Emails",
      "Phones",
      "Websites",
      "Address",
      "Notes",
      "Status",
    ];
    const rows = leads.map((l) => [
      l.name || "",
      l.designation || "",
      l.company || "",
      l.emails.join("; "),
      l.phones.join("; "),
      l.websites.join("; "),
      l.address || "",
      l.notes || "",
      LEAD_STATUS_CONFIG[l.status]?.label || l.status,
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 100);
    toast.success("CSV exported");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leads Pipeline</h1>
          <p className="text-muted-foreground mt-2">
            Manage your extracted contacts and track their status.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportCSV}
          className="shrink-0"
        >
          <Download className="w-4 h-4 mr-2" />
          Export CSV ({leads.length})
        </Button>
      </div>

      <Card className="glass border-border/50">
        <div className="p-4 border-b border-border/50 space-y-4 bg-card/50">
          <form onSubmit={handleSearch} className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, company, email..."
              className="pl-9 bg-background"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          <div className="flex gap-2 w-full overflow-x-auto pb-1 hide-scrollbar">
            <Button
              className={`shrink-0 ${activeFilter === null ? "dark:border-accent" : "dark:border-border"}`}
              variant="outline"
              size="sm"
              onClick={() => handleFilter(null)}
            >
              All
            </Button>
            {Object.entries(LEAD_STATUS_CONFIG).map(([status, config]) => (
              <Button
                className={`shrink-0 ${activeFilter === status ? "dark:border-accent" : "dark:border-border"}`}
                key={status}
                variant="outline"
                size="sm"
                onClick={() => handleFilter(status as LeadStatus)}
              >
                {config.label}
              </Button>
            ))}
          </div>
        </div>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/30">
                <tr>
                  <th className="px-6 py-4 font-medium">Contact Details</th>
                  <th className="px-6 py-4 font-medium hidden md:table-cell">
                    Company
                  </th>
                  <th className="px-6 py-4 font-medium hidden sm:table-cell">
                    Contact Info
                  </th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {isLoading
                  ? [...Array(5)].map((_, i) => (
                      <tr key={i} className="bg-card/30">
                        <td className="px-6 py-4">
                          <Skeleton className="h-10 w-32" />
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          <Skeleton className="h-5 w-24" />
                        </td>
                        <td className="px-6 py-4 hidden sm:table-cell">
                          <Skeleton className="h-8 w-32" />
                        </td>
                        <td className="px-6 py-4">
                          <Skeleton className="h-6 w-20 rounded-full" />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Skeleton className="h-8 w-8 ml-auto rounded-md" />
                        </td>
                      </tr>
                    ))
                  : leads.length === 0
                    ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-6 py-12 text-center text-muted-foreground"
                          >
                            <div className="flex flex-col items-center justify-center">
                              <Users className="w-8 h-8 mb-3 opacity-20" />
                              <p>No leads found.</p>
                            </div>
                          </td>
                        </tr>
                      )
                    : leads.map((lead) => {
                        const statusConfig = LEAD_STATUS_CONFIG[lead.status];
                        return (
                          <tr
                            key={lead.id}
                            className="hover:bg-muted/20 transition-colors group"
                          >
                            <td className="px-6 py-4 min-w-0">
                              <Link
                                href={`/leads/${lead.id}`}
                                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                              >
                                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium shrink-0">
                                  {lead.name?.charAt(0).toUpperCase() || "?"}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-medium text-foreground truncate max-w-37.5">
                                    {lead.name || "Unknown"}
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-0.5 truncate max-w-37.5">
                                    {lead.designation || "No title"}
                                  </div>
                                </div>
                              </Link>
                            </td>
                            <td className="px-6 py-4 hidden md:table-cell">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                {lead.company ? (
                                  <>
                                    <Building className="w-3.5 h-3.5 shrink-0" />
                                    <span className="truncate max-w-37.5">
                                      {lead.company}
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-muted-foreground/50">
                                    —
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 hidden sm:table-cell">
                              <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                                {lead.emails[0] && (
                                  <div className="flex items-center gap-2">
                                    <Mail className="w-3.5 h-3.5 shrink-0" />
                                    <span className="truncate max-w-37.5">
                                      {lead.emails[0]}
                                    </span>
                                  </div>
                                )}
                                {lead.phones[0] && (
                                  <div className="flex items-center gap-2">
                                    <Phone className="w-3.5 h-3.5 shrink-0" />
                                    <span>{lead.phones[0]}</span>
                                  </div>
                                )}
                                {!lead.emails[0] && !lead.phones[0] && (
                                  <span className="text-muted-foreground/50">
                                    No contact info
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border border-transparent ${statusConfig.bgClass} ${statusConfig.textClass}`}
                              >
                                {statusConfig.label}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  type="button"
                                  className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                  onClick={() => openEditDialog(lead)}
                                  aria-label={`Edit ${lead.name || "lead"}`}
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                                  onClick={() =>
                                    setDeletingLeadId(lead.id)
                                  }
                                  aria-label={`Delete ${lead.name || "lead"}`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
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
                    fetchLeads(searchQuery, activeFilter, next);
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
                    fetchLeads(searchQuery, activeFilter, next);
                  }}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <LeadDeleteDialog
        open={!!deletingLeadId}
        onOpenChange={(open) => !open && setDeletingLeadId(null)}
        onConfirm={() => deletingLeadId && handleDelete(deletingLeadId)}
      />

      <LeadEditDialog
        open={!!editingLead}
        onOpenChange={(open) => !open && setEditingLead(null)}
        editForm={editForm}
        setEditForm={setEditForm}
        onSave={handleSaveEdit}
        isSaving={isSaving}
      />
    </div>
  );
}
