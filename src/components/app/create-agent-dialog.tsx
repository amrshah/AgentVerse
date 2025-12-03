
"use client";

import { useState, type ReactNode } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Wand2, Loader2, X } from "lucide-react";
import { createAgentProfile } from "@/ai/flows/create-agent-profile";
import { suggestToolDescription } from "@/ai/flows/suggest-tool-description";
import type { Agent, Tool } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Badge } from "../ui/badge";
import { ORCHESTRATION_PRESETS } from "@/lib/orchestration-presets";
import { Separator } from "../ui/separator";
import { Label } from "@/components/ui/label";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  role: z.string().min(5, "Role description must be at least 5 characters."),
  objectives: z.string().min(10, "Objectives must be at least 10 characters."),
  constraints: z.string().optional(),
  tools: z.array(z.string()).optional(),
});

type CreateAgentDialogProps = {
  children: ReactNode;
  availableTools: Tool[];
  onAgentCreate: (newAgent: Agent) => void;
};

// Flatten preset agents for the dropdown
const presetAgents = ORCHESTRATION_PRESETS.flatMap(preset => 
    preset.agents.map(agent => ({
        ...agent,
        presetName: preset.name,
        id: `${preset.id}-${agent.name}`
    }))
);


export default function CreateAgentDialog({
  children,
  availableTools,
  onAgentCreate,
}: CreateAgentDialogProps) {
  const [open, setOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [customToolDescription, setCustomToolDescription] = useState("");
  const [suggestedSchema, setSuggestedSchema] = useState("");
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      role: "",
      objectives: "",
      constraints: "",
      tools: [],
    },
  });

  const handleGenerateProfile = async () => {
    const role = form.getValues("role");
    if (!role) {
      toast({
        variant: "destructive",
        title: "Cannot generate profile",
        description: "Please provide a role description first.",
      });
      return;
    }
    setIsGenerating(true);
    try {
      const result = await createAgentProfile({ roleDescription: role });
      form.setValue("objectives", result.agentProfile);
      toast({
        title: "Profile Generated",
        description: "Agent objectives have been populated.",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "Could not generate agent profile.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSuggestSchema = async () => {
    if (!customToolDescription) {
        toast({ variant: "destructive", title: "Please describe the tool." });
        return;
    }
    setIsSuggesting(true);
    try {
        const result = await suggestToolDescription({ toolDescription: customToolDescription });
        setSuggestedSchema(result.jsonSchema);
    } catch (error) {
        console.error(error);
        toast({ variant: "destructive", title: "Schema suggestion failed." });
    } finally {
        setIsSuggesting(false);
    }
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    const selectedTools =
      values.tools?.map((toolId) =>
        availableTools.find((t) => t.id === toolId)
      ).filter((t): t is Tool => !!t) || [];

    const randomAvatar = PlaceHolderImages[Math.floor(Math.random() * PlaceHolderImages.length)];
    
    const newAgent: Agent = {
      id: `agent-${Date.now()}-${Math.random()}`,
      ...values,
      constraints: values.constraints || "",
      tools: selectedTools,
      avatar: randomAvatar.imageUrl,
      avatarHint: randomAvatar.imageHint,
    };
    onAgentCreate(newAgent);
    form.reset();
    setOpen(false);
    toast({
        title: "Agent Created",
        description: `Agent "${newAgent.name}" has been added to the pool.`,
    })
  }

  const handlePresetAgentSelect = (agentId: string) => {
    const selectedAgent = presetAgents.find(a => a.id === agentId);
    if (selectedAgent) {
        form.setValue("name", selectedAgent.name);
        form.setValue("role", selectedAgent.role);
        form.setValue("objectives", selectedAgent.objectives);
        toast({
            title: "Preset Loaded",
            description: `Loaded details for "${selectedAgent.name}".`
        })
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) form.reset();
      setOpen(isOpen);
    }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Agent</DialogTitle>
          <DialogDescription>
            Define a new agent, or start from a preset and customize it.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
            <Label>Start from a Preset Agent</Label>
            <Select onValueChange={handlePresetAgentSelect}>
                <SelectTrigger>
                    <SelectValue placeholder="Select a preset agent to start..." />
                </SelectTrigger>
                <SelectContent>
                    {presetAgents.map(agent => (
                        <SelectItem key={agent.id} value={agent.id}>
                           {agent.name} <span className="text-muted-foreground ml-2">({agent.presetName})</span>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>

        <Separator />
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Agent Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., ResearchBot" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., A research assistant that scours the web for information."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Describe the agent's high-level role.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="button"
              variant="outline"
              onClick={handleGenerateProfile}
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-4 w-4" />
              )}
              Generate Objectives with AI
            </Button>

            <FormField
              control={form.control}
              name="objectives"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Objectives</FormLabel>
                  <FormControl>
                    <Textarea placeholder="The specific goals for this agent..." {...field} rows={4} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="constraints"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Constraints</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., Must not access paywalled content." {...field} />
                  </FormControl>
                  <FormDescription>
                    Any limitations or rules the agent must follow.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Controller
              control={form.control}
              name="tools"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tools</FormLabel>
                   <Select onValueChange={(value) => {
                       if (value && !field.value?.includes(value)) {
                           field.onChange([...(field.value || []), value])
                       }
                   }}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select tools to add..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableTools.map(tool => (
                        <SelectItem key={tool.id} value={tool.id} disabled={field.value?.includes(tool.id)}>
                          {tool.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>Assign tools that this agent can use to achieve its objectives.</FormDescription>
                   <div className="flex flex-wrap gap-2 pt-2">
                       {field.value?.map(toolId => {
                           const tool = availableTools.find(t => t.id === toolId);
                           if (!tool) return null;
                           const handleRemove = () => {
                             field.onChange(field.value?.filter(id => id !== toolId));
                           }
                           return (
                            <Badge key={tool.id} variant="secondary">
                                {tool.name}
                                <button type="button" onClick={handleRemove} className="ml-2 rounded-full outline-none hover:bg-muted-foreground/20 p-0.5">
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                           )
                       })}
                   </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-2 rounded-lg border p-4">
                <h3 className="font-semibold">Custom Tool</h3>
                <Textarea placeholder="Describe a custom tool..." value={customToolDescription} onChange={(e) => setCustomToolDescription(e.target.value)} />
                <Button type="button" variant="secondary" onClick={handleSuggestSchema} disabled={isSuggesting} className="w-full">
                    {isSuggesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                    Suggest JSON Schema with AI
                </Button>
                {suggestedSchema && (
                    <div className="mt-2 space-y-2">
                        <Label>Suggested Schema</Label>
                        <pre className="p-2 bg-muted rounded-md text-xs overflow-x-auto"><code className="font-code">{suggestedSchema}</code></pre>
                    </div>
                )}
            </div>

            <DialogFooter>
              <Button type="submit">Create Agent</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

    