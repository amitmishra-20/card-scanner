"use client";

import { useState, useEffect } from "react";
import { Mail, Check } from "lucide-react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { joinWaitlist, isOnWaitlist } from "@/actions/waitlist";
import { toast } from "sonner";

export function WaitlistButton({ className }: { className?: string }) {
  const { data: session } = useSession();
  const [isJoining, setIsJoining] = useState(false);
  const [joined, setJoined] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!session?.user?.email) {
      setChecking(false);
      return;
    }
    isOnWaitlist(session.user.email).then((res) => {
      if (res.success && res.data?.onWaitlist) {
        setJoined(true);
      }
      setChecking(false);
    });
  }, [session?.user?.email]);

  if (!session?.user?.email) return null;

  const handleJoin = async () => {
    setIsJoining(true);
    try {
      const res = await joinWaitlist(session.user!.email!);
      if (res.success) {
        setJoined(true);
        toast.success(res.data?.message || "Joined the waitlist!");
      } else {
        if (res.error?.includes("already")) {
          setJoined(true);
          toast.success("You're already on the waitlist!");
        } else {
          toast.error(res.error || "Failed to join waitlist");
        }
      }
    } catch {
      toast.error("Failed to join waitlist");
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className={className ?? "hidden sm:inline-flex gap-2"}
      onClick={handleJoin}
      disabled={isJoining || joined || checking}
    >
      {joined ? (
        <>
          <Check className="w-4 h-4 text-emerald-400" />
          <span className="text-emerald-400">Joined</span>
        </>
      ) : (
        <>
          <Mail className="w-4 h-4" />
          Join Waitlist
        </>
      )}
    </Button>
  );
}
