"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { Menu, X, ScanLine } from "lucide-react";
import { useSession } from "next-auth/react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { APP_NAV_ITEMS } from "@/constants";

const UserMenu = dynamic(
  () => import("@/components/layout/user-menu").then((m) => m.UserMenu),
  { ssr: false }
);

export function Topbar() {
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-border bg-background/80 backdrop-blur-md z-40 sticky top-0">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Mobile Logo */}
          <Link href="/dashboard" className="md:hidden flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg btn-gradient flex items-center justify-center">
              <ScanLine className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-base tracking-tight">
              Card<span className="text-gradient">Scan</span>
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Scan Button - visible on mobile as icon */}
          <Link
            href="/scan"
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "sm:hidden h-9 w-9"
            )}
          >
            <ScanLine className="h-5 w-5 text-primary" />
          </Link>

          <Link
            href="/scan"
            className={cn(
              buttonVariants({ size: "sm" }),
              "btn-gradient hidden sm:inline-flex"
            )}
          >
            <ScanLine className="w-4 h-4 mr-2" />
            New Scan
          </Link>

          {/* User Menu */}
          {status === "loading" ? (
            <Skeleton className="h-9 w-9 rounded-full" />
          ) : session?.user ? (
            <UserMenu user={session.user} />
          ) : null}
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-50 transition-all duration-300",
          mobileMenuOpen
            ? "pointer-events-auto"
            : "pointer-events-none"
        )}
      >
        {/* Backdrop */}
        <div
          className={cn(
            "absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity duration-300",
            mobileMenuOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={() => setMobileMenuOpen(false)}
        />
        {/* Sidebar panel */}
        <div
          className={cn(
            "fixed inset-y-0 left-0 w-72 bg-sidebar border-r border-sidebar-border shadow-2xl transition-transform duration-300 ease-out",
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="h-16 flex items-center justify-between px-6 border-b border-sidebar-border">
            <Link
              href="/dashboard"
              className="flex items-center gap-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="w-8 h-8 rounded-lg btn-gradient flex items-center justify-center">
                <ScanLine className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight text-sidebar-foreground">
                CardScan
              </span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X className="h-5 w-5 text-sidebar-foreground" />
            </Button>
          </div>

          <nav className="px-3 py-4 space-y-1">
            {APP_NAV_ITEMS.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "group flex items-center px-3 py-3 text-sm font-medium rounded-lg",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
                  )}
                >
                  <item.icon
                    className={cn(
                      "mr-3 h-5 w-5",
                      isActive ? "text-primary" : ""
                    )}
                  />
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}
