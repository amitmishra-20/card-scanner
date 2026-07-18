"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { signUpSchema } from "@/lib/validations";
import { registerUser } from "@/actions/user";
import { AuthLogo } from "@/components/auth/auth-logo";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";
import { useAuthConfig } from "@/components/auth/use-auth-config";

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { googleEnabled } = useAuthConfig();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const validated = signUpSchema.safeParse({ name, email, password });
      if (!validated.success) {
        const msg = validated.error.issues[0]?.message || "Invalid input";
        toast.error(msg);
        return;
      }

      const res = await registerUser({
        name: validated.data.name,
        email: validated.data.email,
        password: validated.data.password,
      });

      if (!res.success) {
        toast.error(res.error);
        return;
      }

      // Auto login after registration
      const result = await signIn("credentials", {
        email: validated.data.email,
        password: validated.data.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Failed to login automatically");
        window.location.href = "/login";
      } else {
        toast.success("Account created successfully!");
        window.location.href = "/dashboard";
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message) {
        toast.error(err.message);
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-black animated-gradient-bg">
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <AuthLogo />
        <h2 className="mt-2 text-center text-3xl font-bold tracking-tight text-foreground">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:text-primary/80 transition-colors">
            Sign in instead
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="glass-strong py-8 px-4 shadow-xl sm:rounded-xl sm:px-10 border border-border/50">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-background/50 focus:bg-background"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background/50 focus:bg-background"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-background/50 focus:bg-background"
              />
              <p className="text-[10px] text-muted-foreground">
                Minimum 8 characters
              </p>
            </div>

            <Button
              type="submit"
              className="w-full btn-gradient shadow-lg shadow-primary/20"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign up"}
            </Button>
          </form>

          {googleEnabled && <GoogleAuthButton disabled={isLoading} />}
        </div>
      </div>
    </div>
  );
}
