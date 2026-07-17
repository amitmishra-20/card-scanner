import Link from "next/link";
import { ScanLine } from "lucide-react";

const footerLinks = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-lg btn-gradient flex items-center justify-center">
              <ScanLine className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-base tracking-tight">
              Card<span className="text-gradient">Scan</span>
            </span>
          </Link>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Social + Copyright */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="flex gap-3">
              <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Twitter</a>
              <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">LinkedIn</a>
              <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">GitHub</a>
            </div>
            <span className="text-xs text-muted-foreground/50 hidden sm:inline">&copy; {new Date().getFullYear()}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
