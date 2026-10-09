"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { createDemoSession, onUserSignUpComplete } from "@/actions/auth-helper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck, Building2, Sparkles, ArrowRight, Loader2, Lock } from "lucide-react";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");

  // Sign In Form State
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");

  // Sign Up Form State
  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await authClient.signIn.email({
        email: signInEmail,
        password: signInPassword,
      });

      if (res.error) {
        toast({
          variant: "destructive",
          title: "Sign In Failed",
          description: res.error.message || "Invalid email or password.",
        });
      } else {
        toast({
          title: "Welcome Back!",
          description: "Signed in successfully. Redirecting...",
        });
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "An unexpected error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await authClient.signUp.email({
        email: signUpEmail,
        password: signUpPassword,
        name: signUpName,
      });

      if (res.error) {
        toast({
          variant: "destructive",
          title: "Sign Up Failed",
          description: res.error.message || "Could not complete registration.",
        });
      } else {
        // Auto-provision workspace & free subscription
        if (res.data?.user?.id) {
          await onUserSignUpComplete(res.data.user.id, signUpName, signUpEmail);
        }

        toast({
          title: "Agency Account Created",
          description: "Your workspace and Free tier quota have been provisioned!",
        });
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "An unexpected error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (role: "admin" | "agency") => {
    setIsLoading(true);
    try {
      const res = await createDemoSession(role);
      if (res.success) {
        toast({
          title: `Logged in as ${role === "admin" ? "Super Admin" : "Agency Admin"}`,
          description: `Access granted for ${res.user?.email}. Redirecting...`,
        });
        const dest = role === "admin" ? "/admin" : callbackUrl;
        router.push(dest);
        router.refresh();
      } else {
        toast({
          variant: "destructive",
          title: "Demo Login Failed",
          description: res.error,
        });
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-background">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 mb-2">
            <Icons.logo className="h-10 w-10 text-primary" />
            <span className="text-2xl font-bold tracking-tight">AgentVerse</span>
          </Link>
          <h1 className="text-xl font-semibold tracking-tight">Enterprise & Agency Gateway</h1>
          <p className="text-sm text-muted-foreground">
            Sign in to manage client brand contexts and multi-agent orchestrations.
          </p>
        </div>

        {/* Auth Tabs Card */}
        <Card className="border-border/60 shadow-xl backdrop-blur">
          <CardHeader className="pb-4">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Create Agency</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="mt-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email Address</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="admin@alamia.agency"
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="signin-password">Password</Label>
                    </div>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="••••••••••••"
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
                    Sign In to Portal
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Agency or Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Alamia Digital Agency"
                      value={signUpName}
                      onChange={(e) => setSignUpName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Business Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="hello@youragency.com"
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password (min. 8 characters)</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••••••"
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      required
                      minLength={8}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    Create Agency Workspace (Free Tier)
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardHeader>

          {/* Quick Demo Evaluation Section */}
          <CardFooter className="flex flex-col border-t pt-4 space-y-3 bg-muted/20">
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                Quick Role-Based Evaluation
              </span>
              <Badge variant="secondary" className="text-[10px]">Instant Session</Badge>
            </div>

            <div className="grid grid-cols-1 gap-2 w-full">
              <Button
                type="button"
                variant="outline"
                className="w-full justify-between h-auto py-2.5 px-3 border-primary/20 hover:border-primary/40 text-left"
                disabled={isLoading}
                onClick={() => handleDemoLogin("agency")}
              >
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-4 h-4 text-primary shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-xs font-medium">Alamia Digital Agency</span>
                    <span className="text-[11px] text-muted-foreground">Agency Admin (Pro Plan)</span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full justify-between h-auto py-2.5 px-3 border-amber-500/20 hover:border-amber-500/40 text-left"
                disabled={isLoading}
                onClick={() => handleDemoLogin("admin")}
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-xs font-medium">Platform Super Admin</span>
                    <span className="text-[11px] text-muted-foreground">Full SaaS Control Center & MRR</span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
              </Button>
            </div>
          </CardFooter>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Protected by Edge D1 Authentication &bull; Powered by OpenNext on Cloudflare
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
