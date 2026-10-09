"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Building2,
  Users,
  CreditCard,
  Zap,
  TrendingUp,
  Activity,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { updateTenantPlan } from "@/actions/admin";

type SaaSAdminDashboardProps = {
  initialStats: any;
};

export default function SaaSAdminDashboard({ initialStats }: SaaSAdminDashboardProps) {
  const [stats, setStats] = useState(initialStats);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const handlePlanChange = async (userId: string, newPlan: 'free' | 'pro' | 'agency') => {
    setIsUpdating(true);
    try {
      const res = await updateTenantPlan(userId, newPlan);
      if (res.success) {
        toast({
          title: "Plan Updated",
          description: `Tenant subscription successfully changed to ${newPlan.toUpperCase()}.`,
        });
        // Optimistically update local state
        setStats((prev: any) => ({
          ...prev,
          subscriptions: prev.subscriptions.map((s: any) =>
            s.userId === userId ? { ...s, plan: newPlan, monthlyQuota: newPlan === 'agency' ? 2500 : newPlan === 'pro' ? 500 : 25 } : s
          ),
        }));
      } else {
        toast({ variant: "destructive", title: "Update Failed", description: res.error });
      }
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* SaaS Admin Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">SaaS Admin Control Center</h1>
            <Badge className="bg-primary/20 text-primary border-primary/30 font-semibold">
              Superadmin
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            Platform-wide metrics, tenant management, payment gateways, and usage analytics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="px-3 py-1 bg-emerald-500/10 text-emerald-500 border-emerald-500/20 flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Cloudflare D1 & Workers AI Online
          </Badge>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Recurring Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">PKR {stats.mrrPKR.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              ~${(stats.mrrPKR / 278).toFixed(0)} USD / month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Agency Tenants</CardTitle>
            <Building2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTenants}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.activePaidSubscriptions} on Pro / Agency tier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Client Brand Contexts</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClientBrands}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Configured across all workspaces
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Agent Orchestrations</CardTitle>
            <Zap className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrchestrations}</div>
            <p className="text-xs text-muted-foreground mt-1">
              ~{stats.estimatedTokensUsed.toLocaleString()} tokens processed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="tenants" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="tenants">Tenants & Plans</TabsTrigger>
          <TabsTrigger value="gateways">Payment Gateways</TabsTrigger>
          <TabsTrigger value="clients">Client Brands</TabsTrigger>
          <TabsTrigger value="runs">Run Logs</TabsTrigger>
        </TabsList>

        {/* Tenants Tab */}
        <TabsContent value="tenants" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Agency Tenants & Subscriptions</CardTitle>
              <CardDescription>
                Manage agency accounts, upgrade tiers, and monitor usage limits.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Workspace / Agency</TableHead>
                    <TableHead>Current Plan</TableHead>
                    <TableHead>Usage / Quota</TableHead>
                    <TableHead>Gateway</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.workspaces.map((ws: any) => {
                    const sub = stats.subscriptions.find((s: any) => s.userId === ws.ownerId) || stats.subscriptions[0];
                    return (
                      <TableRow key={ws.id}>
                        <TableCell className="font-medium">
                          <div>
                            <p className="font-semibold">{ws.name}</p>
                            <p className="text-xs text-muted-foreground">slug: {ws.slug}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              sub?.plan === 'agency'
                                ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                                : sub?.plan === 'pro'
                                ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                                : 'bg-muted text-muted-foreground'
                            }
                          >
                            {(sub?.plan || 'Free').toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">{sub?.currentUsage || 0}</span>
                            <span className="text-xs text-muted-foreground">/ {sub?.monthlyQuota || 25} runs</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {sub?.paymentProvider || 'Safepay'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isUpdating}
                            onClick={() => handlePlanChange(ws.ownerId, sub?.plan === 'pro' ? 'free' : 'pro')}
                          >
                            {sub?.plan === 'pro' ? 'Downgrade to Free' : 'Upgrade to Pro'}
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            disabled={isUpdating}
                            onClick={() => handlePlanChange(ws.ownerId, 'agency')}
                          >
                            Set Agency Plan
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Gateways Tab */}
        <TabsContent value="gateways" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-emerald-500/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-emerald-500" />
                    Safepay (Pakistan Market)
                  </CardTitle>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                    Primary (PKR)
                  </Badge>
                </div>
                <CardDescription>
                  Supports JazzCash, Easypaisa, PayFast, and Pakistani Credit/Debit cards (1Link / PayPak).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-muted/50 rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Currency:</span>
                    <span className="font-semibold">PKR (Pakistani Rupee)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Agency Pro Pricing:</span>
                    <span className="font-semibold">PKR 8,500 / month</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Webhook Endpoint:</span>
                    <code className="text-xs bg-background px-1.5 py-0.5 rounded">/api/webhooks/safepay</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Integration Mode:</span>
                    <Badge variant="outline" className="text-xs">Sandbox Ready</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-500/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                    Lemon Squeezy (International)
                  </CardTitle>
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                    Global (USD)
                  </Badge>
                </div>
                <CardDescription>
                  Merchant of Record handling global tax, VAT, compliance, and international credit cards.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-muted/50 rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Currency:</span>
                    <span className="font-semibold">USD ($)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Agency Pro Pricing:</span>
                    <span className="font-semibold">$29.00 / month</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Webhook Endpoint:</span>
                    <code className="text-xs bg-background px-1.5 py-0.5 rounded">/api/webhooks/lemonsqueezy</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Integration Mode:</span>
                    <Badge variant="outline" className="text-xs">Merchant of Record</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Client Brands Tab */}
        <TabsContent value="clients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Client Brand Context Profiles ({stats.clients.length})</CardTitle>
              <CardDescription>
                Brand voices, audience guidelines, and industry contexts configured by agency users.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Brand Name</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Brand Voice</TableHead>
                    <TableHead>Target Audience</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.clients.map((c: any) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-semibold">{c.name}</TableCell>
                      <TableCell><Badge variant="outline">{c.industry || 'General'}</Badge></TableCell>
                      <TableCell className="text-sm text-muted-foreground">{c.brandVoice || 'Professional'}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{c.targetAudience || 'General'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Run Logs Tab */}
        <TabsContent value="runs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent AI Team Executions</CardTitle>
              <CardDescription>
                Auditable log of orchestrations, client brand context bindings, and status.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Team</TableHead>
                    <TableHead>Client Context</TableHead>
                    <TableHead>Task Prompt</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.recentOrchestrations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                        No orchestration runs recorded yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    stats.recentOrchestrations.map((run: any) => (
                      <TableRow key={run.id}>
                        <TableCell className="font-semibold">{run.teamName}</TableCell>
                        <TableCell>
                          {run.clientName ? (
                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                              {run.clientName}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">General</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs max-w-xs truncate">{run.task}</TableCell>
                        <TableCell><code className="text-xs">{run.modelUsed}</code></TableCell>
                        <TableCell>
                          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                            {run.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
