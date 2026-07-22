"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";
import {
  ArrowLeft,
  Mail,
  Phone,
  Globe,
  MapPin,
  FileText,
  Edit,
  Trash2,
  Clock,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getLead,
  deleteLeadAction,
  updateLeadStatusAction,
  updateLead,
} from "@/actions/leads";
import { LEAD_STATUS_CONFIG } from "@/constants";
import { cn } from "@/lib/utils";
import type { Lead, LeadStatus } from "@/types";
import { toast } from "sonner";

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

export default function LeadDetailPage() {
  const router = useRouter();
  const params = useParams();
  const leadId = params.id as string;

  const [lead, setLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  const [isStatusChanging, setIsStatusChanging] = useState(false);

  useEffect(() => {
    const fetchLead = async () => {
      try {
        const res = await getLead(leadId);
        if (res.success && res.data) {
          setLead(res.data as Lead);
        } else {
          setError(res.error || "Lead not found");
        }
      } catch {
        setError("Failed to load lead");
      } finally {
        setIsLoading(false);
      }
    };
    fetchLead();
  }, [leadId]);

  const handleDelete = async () => {
    setDeletingLeadId(null);
    try {
      const res = await deleteLeadAction(leadId);
      if (res.success) {
        toast.success("Lead deleted");
        router.push("/leads");
      } else {
        toast.error(res.error || "Failed to delete lead");
      }
    } catch {
      toast.error("Failed to delete lead");
    }
  };

  const handleStatusChange = async (status: LeadStatus) => {
    if (status === lead?.status || isStatusChanging) return;
    const previousLead = lead;
    setIsStatusChanging(true);
    setLead((prev) => (prev ? { ...prev, status } : prev));

    try {
      const res = await updateLeadStatusAction(leadId, status);
      if (res.success) {
        toast.success(`Status updated to ${LEAD_STATUS_CONFIG[status].label}`);
      } else {
        setLead(previousLead);
        toast.error(res.error || "Failed to update status");
      }
    } catch {
      setLead(previousLead);
      toast.error("Failed to update status");
    } finally {
      setIsStatusChanging(false);
    }
  };

  const openEditDialog = () => {
    if (!lead) return;
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
        const refreshed = await getLead(leadId);
        if (refreshed.success && refreshed.data) {
          setLead(refreshed.data as Lead);
        }
      } else {
        toast.error(res.error || "Failed to update lead");
      }
    } catch {
      toast.error("Failed to update lead");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <Skeleton className="h-8 w-32" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Skeleton className="h-96 rounded-xl" />
          </div>
          <div>
            <Skeleton className="h-64 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-center">
        <p className="text-muted-foreground mb-4">
          {error || "Lead not found"}
        </p>
        <Button variant="outline" onClick={() => router.push("/leads")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Leads
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/leads")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {lead.name || "Unknown"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {lead.designation}
              {lead.company ? ` at ${lead.company}` : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={openEditDialog}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => setDeletingLeadId(lead.id)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle>Contact Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {lead.emails.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Emails
                  </p>
                  {lead.emails.map((email, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                      <a
                        href={`mailto:${email}`}
                        className="text-primary hover:underline"
                      >
                        {email}
                      </a>
                    </div>
                  ))}
                </div>
              )}

              {lead.phones.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Phones
                  </p>
                  {lead.phones.map((phone, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                      <a
                        href={`tel:${phone}`}
                        className="text-primary hover:underline"
                      >
                        {phone}
                      </a>
                    </div>
                  ))}
                </div>
              )}

              {lead.websites.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Websites
                  </p>
                  {lead.websites.map((website, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
                      <a
                        href={website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {website}
                      </a>
                    </div>
                  ))}
                </div>
              )}

              {lead.address && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Address
                  </p>
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                    <span>{lead.address}</span>
                  </div>
                </div>
              )}

              {!lead.emails.length &&
                !lead.phones.length &&
                !lead.websites.length &&
                !lead.address && (
                  <p className="text-sm text-muted-foreground">
                    No contact details available.
                  </p>
                )}
            </CardContent>
          </Card>

          {lead.notes && (
            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-2 text-sm">
                  <FileText className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                  <p className="whitespace-pre-wrap">{lead.notes}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(LEAD_STATUS_CONFIG) as LeadStatus[]).map((s) => {
                  const sConfig = LEAD_STATUS_CONFIG[s];
                  const isActive = s === lead.status;
                  return (
                    <button
                      key={s}
                      type="button"
                      disabled={isActive || isStatusChanging}
                      onClick={() => handleStatusChange(s)}
                      className={cn(
                        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border transition-all",
                        isActive
                          ? `${sConfig.bgClass} ${sConfig.textClass} border-transparent cursor-default ring-2 ring-offset-2 ring-offset-background`
                          : "border-border/50 text-muted-foreground hover:bg-muted/50 hover:text-foreground cursor-pointer",
                        isStatusChanging && !isActive && "opacity-50 pointer-events-none"
                      )}
                      style={isActive ? { boxShadow: `0 0 0 2px ${sConfig.color}40` } : undefined}
                    >
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: sConfig.color }}
                      />
                      {sConfig.label}
                      {isActive && isStatusChanging && (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      )}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Click any status to move this lead
              </p>
            </CardContent>
          </Card>

          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-muted-foreground">Created</p>
                  <p className="font-medium">
                    {new Date(lead.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-muted-foreground">Last Updated</p>
                  <p className="font-medium">
                    {new Date(lead.updatedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <LeadDeleteDialog
        open={!!deletingLeadId}
        onOpenChange={(open) => !open && setDeletingLeadId(null)}
        onConfirm={handleDelete}
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
