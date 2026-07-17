"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { ScanLine, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { signUpSchema } from "@/lib/validations";
import { registerUser, getAuthConfigAction } from "@/actions/user";

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [googleEnabled, setGoogleEnabled] = useState(false);

  useEffect(() => {
    getAuthConfigAction().then((res) => {
      if (res.success && res.data) {
        setGoogleEnabled(res.data.googleEnabled);
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const validated = signUpSchema.parse({ name, email, password });
      
      const res = await registerUser({
        name: validated.name,
        email: validated.email,
        password: validated.password,
      });

      if (!res.success) {
        toast.error(res.error);
        return;
      }

      // Auto login after registration
      const result = await signIn("credentials", {
        email: validated.email,
        password: validated.password,
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
      const errorMessage = (() => {
        if (err instanceof Error) {
          return err.message;
        }

        if (
          typeof err === "object" &&
          err !== null &&
          "errors" in err &&
          Array.isArray((err as { errors?: unknown }).errors)
        ) {
          const errors = (err as { errors?: { message?: string }[] }).errors;
          return errors?.[0]?.message;
        }

        return undefined;
      })();

      toast.error(errorMessage || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setIsLoading(true);
    signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-black animated-gradient-bg">
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link href="/" className="flex justify-center items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg btn-gradient flex items-center justify-center shadow-lg shadow-primary/20">
            <ScanLine className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-2xl tracking-tight">
            Card<span className="text-gradient">Scan</span>
          </span>
        </Link>
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
            </div>

            <Button
              type="submit"
              className="w-full btn-gradient shadow-lg shadow-primary/20"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign up"}
            </Button>
          </form>

          {googleEnabled && (
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/50" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-card text-muted-foreground rounded-full text-xs">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full glass bg-white/5 hover:bg-white/10 text-foreground"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Google
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
