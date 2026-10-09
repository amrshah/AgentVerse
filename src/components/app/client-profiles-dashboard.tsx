"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Building2,
  Globe,
  Plus,
  Trash2,
  Edit,
  Sparkles,
  Target,
  MessageSquare,
  BookOpen,
  CheckCircle2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  getClientProfiles,
  createClientProfile,
  updateClientProfile,
  deleteClientProfile,
  type ClientProfileData,
} from "@/actions/client-profiles";

export default function ClientProfilesDashboard() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ClientProfileData>({
    name: "",
    website: "",
    industry: "",
    targetAudience: "",
    brandVoice: "",
    contentGuidelines: "",
    keywords: "",
    knowledgeContext: "",
    isDefault: false,
  });

  const { toast } = useToast();

  const loadProfiles = async () => {
    setIsLoading(true);
    const data = await getClientProfiles();
    setProfiles(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      name: "",
      website: "",
      industry: "",
      targetAudience: "",
      brandVoice: "",
      contentGuidelines: "",
      keywords: "",
      knowledgeContext: "",
      isDefault: profiles.length === 0,
    });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (profile: any) => {
    setEditingId(profile.id);
    setFormData({
      name: profile.name,
      website: profile.website || "",
      industry: profile.industry || "",
      targetAudience: profile.targetAudience || "",
      brandVoice: profile.brandVoice || "",
      contentGuidelines: profile.contentGuidelines || "",
      keywords: profile.keywords || "",
      knowledgeContext: profile.knowledgeContext || "",
      isDefault: profile.isDefault || false,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Client or Brand name is required.",
      });
      return;
    }

    if (editingId) {
      const res = await updateClientProfile(editingId, formData);
      if (res.success) {
        toast({ title: "Client Updated", description: "Brand context has been updated." });
      }
    } else {
      const res = await createClientProfile(formData);
      if (res.success) {
        toast({ title: "Client Created", description: "New client profile created." });
      }
    }

    setIsDialogOpen(false);
    loadProfiles();
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      await deleteClientProfile(id);
      toast({ title: "Client Deleted", description: `${name} has been removed.` });
      loadProfiles();
    }
  };

  const handleSetDefault = async (id: string) => {
    await updateClientProfile(id, { isDefault: true });
    toast({ title: "Default Set", description: "Default client context updated." });
    loadProfiles();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" /> Agency Client Contexts & Brands
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Configure brand voice, target audience, and editorial rules for each of your agency&apos;s clients.
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2">
          <Plus className="h-4 w-4" /> Add Client Brand
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse h-64 bg-muted/40" />
          ))}
        </div>
      ) : profiles.length === 0 ? (
        <div className="text-center py-12 border rounded-xl bg-muted/20">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <h3 className="text-lg font-semibold">No Client Profiles Yet</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto mb-4">
            Add your agency&apos;s clients to give your AI agents specific brand voice, target audience, and knowledge context.
          </p>
          <Button onClick={handleOpenCreate} className="gap-2">
            <Plus className="h-4 w-4" /> Create First Client Profile
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.map((profile) => (
            <Card key={profile.id} className={`flex flex-col transition-all hover:shadow-md ${profile.isDefault ? "border-primary/60 ring-1 ring-primary/20" : ""}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {profile.name}
                      {profile.isDefault && (
                        <Badge variant="default" className="text-xs bg-primary/90">
                          Active Context
                        </Badge>
                      )}
                    </CardTitle>
                    {profile.industry && (
                      <CardDescription className="text-xs mt-1">
                        {profile.industry}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(profile)}>
                      <Edit className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(profile.id, profile.name)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 flex-grow text-xs text-muted-foreground">
                {profile.website && (
                  <div className="flex items-center gap-2 text-foreground font-mono">
                    <Globe className="h-3.5 w-3.5 text-primary" />
                    <a href={profile.website} target="_blank" rel="noreferrer" className="hover:underline truncate">
                      {profile.website}
                    </a>
                  </div>
                )}

                {profile.brandVoice && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-foreground font-semibold">
                      <MessageSquare className="h-3.5 w-3.5 text-primary" /> Brand Voice & Tone:
                    </div>
                    <p className="line-clamp-2 bg-muted/50 p-2 rounded text-xs">{profile.brandVoice}</p>
                  </div>
                )}

                {profile.targetAudience && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-foreground font-semibold">
                      <Target className="h-3.5 w-3.5 text-primary" /> Target Audience:
                    </div>
                    <p className="line-clamp-2 text-xs">{profile.targetAudience}</p>
                  </div>
                )}

                {profile.keywords && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {profile.keywords.split(",").slice(0, 4).map((kw: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="text-[10px] px-1.5 py-0.5">
                        {kw.trim()}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>

              <CardFooter className="pt-2 border-t flex justify-between items-center text-xs">
                {!profile.isDefault ? (
                  <Button variant="ghost" size="sm" onClick={() => handleSetDefault(profile.id)} className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Make Active Context
                  </Button>
                ) : (
                  <span className="text-xs text-primary flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Default for Team Runs
                  </span>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                {editingId ? "Edit Client Brand Profile" : "Create New Client Brand Profile"}
              </DialogTitle>
              <DialogDescription>
                Define your client&apos;s brand parameters so agents automatically adopt the right voice, guidelines, and industry context.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Client / Brand Name *</label>
                <Input
                  placeholder="e.g. Kamal Express Logistics"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Industry</label>
                <Input
                  placeholder="e.g. Supply Chain & Logistics"
                  value={formData.industry || ""}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Website</label>
              <Input
                placeholder="https://example.com"
                value={formData.website || ""}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Brand Voice & Tone</label>
              <Input
                placeholder="e.g. Authoritative, dependable, fast, customer-obsessed"
                value={formData.brandVoice || ""}
                onChange={(e) => setFormData({ ...formData, brandVoice: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Target Audience (ICP)</label>
              <Textarea
                placeholder="e.g. E-commerce business owners, cross-border traders, supply chain managers"
                value={formData.targetAudience || ""}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                className="h-20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Editorial Guidelines & Rules (Do&apos;s / Don&apos;ts)</label>
              <Textarea
                placeholder="e.g. Always emphasize 100% on-time delivery; avoid hype or unsubstantiated claims"
                value={formData.contentGuidelines || ""}
                onChange={(e) => setFormData({ ...formData, contentGuidelines: e.target.value })}
                className="h-20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Primary Focus Keywords</label>
              <Input
                placeholder="e.g. freight forwarding, customs clearance, air cargo, tracking"
                value={formData.keywords || ""}
                onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Company Knowledge & Background Context</label>
              <Textarea
                placeholder="Paste company background, key statistics, product summaries, or case studies..."
                value={formData.knowledgeContext || ""}
                onChange={(e) => setFormData({ ...formData, knowledgeContext: e.target.value })}
                className="h-24"
              />
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingId ? "Save Changes" : "Create Profile"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
