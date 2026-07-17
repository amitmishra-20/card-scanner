"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { LEAD_STATUS_CONFIG } from "@/constants";
import type { LeadStatus } from "@/types";

interface LeadEditForm {
  name: string;
  designation: string;
  company: string;
  emails: string;
  phones: string;
  websites: string;
  address: string;
  notes: string;
  status: LeadStatus;
}

interface LeadEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editForm: LeadEditForm;
  setEditForm: React.Dispatch<React.SetStateAction<LeadEditForm>>;
  onSave: () => void;
  isSaving: boolean;
}

export function LeadEditDialog({
  open,
  onOpenChange,
  editForm,
  setEditForm,
  onSave,
  isSaving,
}: LeadEditDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-designation">Designation</Label>
              <Input
                id="edit-designation"
                value={editForm.designation}
                onChange={(e) =>
                  setEditForm({ ...editForm, designation: e.target.value })
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-company">Company</Label>
            <Input
              id="edit-company"
              value={editForm.company}
              onChange={(e) =>
                setEditForm({ ...editForm, company: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-emails">Emails (comma separated)</Label>
            <Input
              id="edit-emails"
              value={editForm.emails}
              onChange={(e) =>
                setEditForm({ ...editForm, emails: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-phones">Phones (comma separated)</Label>
            <Input
              id="edit-phones"
              value={editForm.phones}
              onChange={(e) =>
                setEditForm({ ...editForm, phones: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-websites">Websites (comma separated)</Label>
            <Input
              id="edit-websites"
              value={editForm.websites}
              onChange={(e) =>
                setEditForm({ ...editForm, websites: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-address">Address</Label>
            <Input
              id="edit-address"
              value={editForm.address}
              onChange={(e) =>
                setEditForm({ ...editForm, address: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-status">Status</Label>
            <select
              id="edit-status"
              value={editForm.status}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  status: e.target.value as LeadStatus,
                })
              }
              className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {Object.entries(LEAD_STATUS_CONFIG).map(([status, config]) => (
                <option key={status} value={status}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-notes">Notes</Label>
            <Textarea
              id="edit-notes"
              value={editForm.notes}
              onChange={(e) =>
                setEditForm({ ...editForm, notes: e.target.value })
              }
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="btn-gradient"
            onClick={onSave}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
