import Link from "next/link";
import { ScanLine } from "lucide-react";

export function AuthLogo() {
  return (
    <Link href="/" className="flex justify-center items-center gap-2 mb-6">
      <div className="w-8 h-8 rounded-lg btn-gradient flex items-center justify-center shadow-lg shadow-primary/20">
        <ScanLine className="w-4 h-4 text-white" />
      </div>
      <span className="font-bold text-2xl tracking-tight">
        Card<span className="text-gradient">Scan</span>
      </span>
    </Link>
  );
}
