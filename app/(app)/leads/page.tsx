"use client";
import { useState, useEffect, useCallback } from "react";
import { 
  Users, 
  Search, 
  MoreVertical,
  Mail,
  Phone,
  Building,
  Trash2,
  Edit,
  ChevronLeft,
  ChevronRight,
  Download
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { getLeads, deleteLeadAction, updateLeadStatusAction, updateLead } from "@/actions/leads";
import { LEAD_STATUS_CONFIG } from "@/constants";
import type { Lead, LeadStatus } from "@/types";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Edit dialog state
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

  const fetchLeads = useCallback(async (search = "", status?: string | null, p = 1) => {
    setIsLoading(true);
    const res = await getLeads({ search, status: status as LeadStatus | undefined, page: p });
    if (res.success && res.data) {
      setLeads(res.data.leads as Lead[]);
      setTotalPages(res.data.totalPages);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchLeads();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [fetchLeads]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLeads(searchQuery, activeFilter, 1);
  };

  const handleFilter = (status: string | null) => {
    setActiveFilter(status);
    setPage(1);
    fetchLeads(searchQuery, status, 1);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lead?")) return;
    const res = await deleteLeadAction(id);
    if (res.success) {
      toast.success("Lead deleted");
      setLeads(leads.filter(l => l.id !== id));
    } else {
      toast.error(res.error || "Failed to delete lead");
    }
  };

  const handleStatusChange = async (leadId: string, status: LeadStatus) => {
    const res = await updateLeadStatusAction(leadId, status);
    if (res.success) {
      toast.success(`Status updated to ${LEAD_STATUS_CONFIG[status].label}`);
      setLeads(leads.map(l => l.id === leadId ? { ...l, status } : l));
    } else {
      toast.error(res.error || "Failed to update status");
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
    const res = await updateLead({
      id: editingLead.id,
      name: editForm.name || null,
      designation: editForm.designation || null,
      company: editForm.company || null,
      emails: editForm.emails.split(",").map(e => e.trim()).filter(Boolean),
      phones: editForm.phones.split(",").map(p => p.trim()).filter(Boolean),
      websites: editForm.websites.split(",").map(w => w.trim()).filter(Boolean),
      address: editForm.address || null,
      notes: editForm.notes || null,
      status: editForm.status,
    });
    setIsSaving(false);
    if (res.success) {
      toast.success("Lead updated");
      setEditingLead(null);
      fetchLeads(searchQuery, activeFilter, page);
    } else {
      toast.error(res.error || "Failed to update lead");
    }
  };

  const handleExportCSV = () => {
    if (leads.length === 0) {
      toast.error("No leads to export");
      return;
    }
    const headers = ["Name", "Designation", "Company", "Emails", "Phones", "Websites", "Address", "Notes", "Status"];
    const rows = leads.map(l => [
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
    const csv = [headers, ...rows].map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
        <Button variant="outline" size="sm" onClick={handleExportCSV} className="shrink-0">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
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
              variant="outline" 
              size="sm" 
              onClick={() => handleFilter(null)} 
              className={`shrink-0 ${activeFilter === null ? "bg-primary text-primary-foreground" : "bg-background"}`}
            >
              All
            </Button>
            {Object.entries(LEAD_STATUS_CONFIG).map(([status, config]) => (
              <Button 
                key={status} 
                variant="outline" 
                size="sm" 
                onClick={() => handleFilter(status)}
                className={`shrink-0 ${activeFilter === status ? "bg-primary text-primary-foreground" : "bg-background"}`}
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
                  <th className="px-6 py-4 font-medium hidden md:table-cell">Company</th>
                  <th className="px-6 py-4 font-medium hidden sm:table-cell">Contact Info</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="bg-card/30">
                      <td className="px-6 py-4"><Skeleton className="h-10 w-32" /></td>
                      <td className="px-6 py-4 hidden md:table-cell"><Skeleton className="h-5 w-24" /></td>
                      <td className="px-6 py-4 hidden sm:table-cell"><Skeleton className="h-8 w-32" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
                      <td className="px-6 py-4 text-right"><Skeleton className="h-8 w-8 ml-auto rounded-md" /></td>
                    </tr>
                  ))
                ) : leads.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center">
                        <Users className="w-8 h-8 mb-3 opacity-20" />
                        <p>No leads found.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  leads.map((lead) => {
                    const statusConfig = LEAD_STATUS_CONFIG[lead.status];
                    return (
                      <tr key={lead.id} className="hover:bg-muted/20 transition-colors group">
                        <td className="px-6 py-4 min-w-0">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium shrink-0">
                              {lead.name?.charAt(0).toUpperCase() || "?"}
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium text-foreground truncate max-w-37.5">{lead.name || "Unknown"}</div>
                              <div className="text-xs text-muted-foreground mt-0.5 truncate max-w-37.5">{lead.designation || "No title"}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            {lead.company ? (
                              <>
                                <Building className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate max-w-37.5">{lead.company}</span>
                              </>
                            ) : (
                              <span className="text-muted-foreground/50">—</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden sm:table-cell">
                          <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                            {lead.emails[0] && (
                              <div className="flex items-center gap-2">
                                <Mail className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate max-w-37.5">{lead.emails[0]}</span>
                              </div>
                            )}
                            {lead.phones[0] && (
                              <div className="flex items-center gap-2">
                                <Phone className="w-3.5 h-3.5 shrink-0" />
                                <span>{lead.phones[0]}</span>
                              </div>
                            )}
                            {!lead.emails[0] && !lead.phones[0] && (
                              <span className="text-muted-foreground/50">No contact info</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border border-transparent ${statusConfig.bgClass} ${statusConfig.textClass}`}>
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger>
                              <Button variant="ghost" className="h-8 w-8 p-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                <span className="sr-only">Open menu</span>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="cursor-pointer" onClick={() => openEditDialog(lead)}>
                                <Edit className="w-4 h-4 mr-2" /> Edit details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {Object.entries(LEAD_STATUS_CONFIG).map(([status, config]) => (
                                <DropdownMenuItem 
                                  key={status} 
                                  className="cursor-pointer"
                                  onClick={() => handleStatusChange(lead.id, status as LeadStatus)}
                                >
                                  Mark as {config.label}
                                </DropdownMenuItem>
                              ))}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-destructive focus:text-destructive cursor-pointer"
                                onClick={() => handleDelete(lead.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
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
                  onClick={() => { setPage(p => p - 1); fetchLeads(searchQuery, activeFilter, page - 1); }}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={page >= totalPages}
                  onClick={() => { setPage(p => p + 1); fetchLeads(searchQuery, activeFilter, page + 1); }}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Lead Dialog */}
      <Dialog open={!!editingLead} onOpenChange={(open) => !open && setEditingLead(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Lead</DialogTitle>
            <DialogDescription>
              Update the contact details for this lead.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input 
                  id="edit-name" 
                  value={editForm.name} 
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-designation">Designation</Label>
                <Input 
                  id="edit-designation" 
                  value={editForm.designation} 
                  onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-company">Company</Label>
              <Input 
                id="edit-company" 
                value={editForm.company} 
                onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-emails">Emails (comma separated)</Label>
              <Input 
                id="edit-emails" 
                value={editForm.emails} 
                onChange={(e) => setEditForm({ ...editForm, emails: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phones">Phones (comma separated)</Label>
              <Input 
                id="edit-phones" 
                value={editForm.phones} 
                onChange={(e) => setEditForm({ ...editForm, phones: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-websites">Websites (comma separated)</Label>
              <Input 
                id="edit-websites" 
                value={editForm.websites} 
                onChange={(e) => setEditForm({ ...editForm, websites: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-address">Address</Label>
              <Input 
                id="edit-address" 
                value={editForm.address} 
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <select 
                id="edit-status"
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value as LeadStatus })}
                className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {Object.entries(LEAD_STATUS_CONFIG).map(([status, config]) => (
                  <option key={status} value={status}>{config.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea 
                id="edit-notes" 
                value={editForm.notes} 
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingLead(null)}>Cancel</Button>
            <Button className="btn-gradient" onClick={handleSaveEdit} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
