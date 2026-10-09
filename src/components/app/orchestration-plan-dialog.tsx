
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import type { Agent } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, Loader2, Sparkles, Wand2, Copy, ExternalLink, Building2, UserCheck, Shield } from "lucide-react";
import { runOrchestration } from "@/ai/flows/run-orchestration";
import { getClientProfiles } from "@/actions/client-profiles";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "../ui/textarea";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CodeBlock from "./code-block";

type OrchestrationPlanDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  teamAgents: Agent[];
  teamName: string;
  initialTask?: string;
};

export default function OrchestrationPlanDialog({
  isOpen,
  onOpenChange,
  teamAgents,
  teamName,
  initialTask = "Write a report on the future of AI.",
}: OrchestrationPlanDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState("");
  const [task, setTask] = useState(initialTask);
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("none");
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      getClientProfiles().then((data) => {
        setClients(data);
        const defaultClient = data.find((c) => c.isDefault);
        if (defaultClient && selectedClientId === "none") {
          setSelectedClientId(defaultClient.id);
        }
      });
    }
  }, [isOpen]);

  const selectedClient = clients.find((c) => c.id === selectedClientId);

  const handleConfirmRun = async () => {
    if (teamAgents.length === 0) {
      toast({
        variant: "destructive",
        title: "Orchestration Failed",
        description: "Cannot run an orchestration with an empty team.",
      });
      return;
    }
    
    setIsLoading(true);
    setResult("");
    toast({
      title: "Orchestration Started",
      description: `Running team "${teamName}" with ${teamAgents.length} agent(s)${selectedClient ? ` for ${selectedClient.name}` : ''}.`,
    });

    try {
      const agentsForFlow = teamAgents.map(a => ({ name: a.name, role: a.role, objectives: a.objectives }));
      const response = await runOrchestration({
        teamName,
        agents: agentsForFlow,
        task,
        clientProfileId: selectedClientId === "none" ? undefined : selectedClientId,
      });
      let displayResult = response.result || "";
      const codeMatch = displayResult.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
      if (codeMatch) displayResult = codeMatch[1].trim();
      try {
        const parsed = JSON.parse(displayResult);
        if (parsed && typeof parsed.result === "string") displayResult = parsed.result;
        else if (parsed && typeof parsed.response === "string") displayResult = parsed.response;
      } catch {}
      setResult(displayResult);
      toast({
        title: "Orchestration Complete",
        description: `Team "${teamName}" has finished its tasks.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Orchestration Failed",
        description: "Could not run the orchestration.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(result);
    toast({ title: "Result Copied", description: "The result has been copied to your clipboard." });
  };

  const handleOpenInNewTab = () => {
    const newTabContent = `
      <html>
        <head>
          <title>Orchestration Result: ${task}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
              line-height: 1.6;
              color: #e0e0e0;
              background-color: #1a1a1a;
              margin: 0;
              padding: 2rem 4rem;
            }
            .container {
              max-width: 800px;
              margin: 0 auto;
            }
            h1, h2, h3, h4, h5, h6 {
              color: #ffffff;
              font-weight: 600;
              margin-top: 1.5em;
              margin-bottom: 0.5em;
            }
            h1 { font-size: 2.25rem; border-bottom: 1px solid #444; padding-bottom: 0.5rem; }
            h2 { font-size: 1.75rem; border-bottom: 1px solid #444; padding-bottom: 0.5rem; }
            h3 { font-size: 1.5rem; }
            p { margin-bottom: 1rem; }
            ul, ol { margin-bottom: 1rem; padding-left: 1.5rem; }
            li { margin-bottom: 0.5rem; }
            code {
              font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace;
              background-color: #333;
              padding: 0.2em 0.4em;
              border-radius: 3px;
              font-size: 85%;
            }
            pre {
              background-color: #282c34;
              color: #abb2bf;
              padding: 1rem;
              border-radius: 0.5rem;
              overflow-x: auto;
              white-space: pre-wrap;
              word-wrap: break-word;
            }
            pre code {
              padding: 0;
              background-color: transparent;
            }
            a {
              color: #61afef;
              text-decoration: none;
            }
            a:hover {
              text-decoration: underline;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 1rem;
            }
            th, td {
              border: 1px solid #444;
              padding: 0.75rem;
              text-align: left;
            }
            th {
              background-color: #2c313a;
            }
            blockquote {
              border-left: 4px solid #555;
              padding-left: 1rem;
              margin-left: 0;
              color: #999;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Result for: ${task}</h1>
            <div id="content"></div>
          </div>
          <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
          <script>
            document.getElementById('content').innerHTML = marked.parse(\`${result.replace(/`/g, '\\`')}\`);
          </script>
        </body>
      </html>
    `;

    const blob = new Blob([newTabContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
};


  const handleClose = () => {
    onOpenChange(false);
    // Delay resetting state to allow for exit animation
    setTimeout(() => {
        setResult("");
        setIsLoading(false);
        setTask(initialTask);
    }, 300);
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose()}}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Orchestration Plan for {teamName}</DialogTitle>
          <DialogDescription>
            Define a task and review the agents before running the orchestration.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow overflow-y-auto p-1">
            <div className="flex flex-col gap-4 min-h-[400px]">
                <h3 className="font-semibold text-lg flex-shrink-0">Team Composition</h3>
                <div className="space-y-4 flex-grow overflow-y-auto p-1 pr-4 rounded-lg border">
                {teamAgents.map((agent) => (
                    <div key={agent.id} className="flex gap-4 p-4 rounded-lg border bg-background">
                    <Avatar>
                        <AvatarImage src={agent.avatar} alt={agent.name} />
                        <AvatarFallback>
                        <Bot />
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-grow">
                        <h4 className="font-semibold">{agent.name} <span className="text-sm text-muted-foreground font-normal">- {agent.role}</span></h4>
                        <p className="text-sm text-muted-foreground mt-1">
                        <strong>Objectives:</strong> {agent.objectives}
                        </p>
                    </div>
                    </div>
                ))}
                </div>
            </div>
            <div className="flex flex-col gap-4 min-h-[400px]">
                {/* Client Brand Context Selector */}
                <div className="space-y-1.5 p-3 rounded-lg border bg-card/60">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold flex items-center gap-1.5 text-foreground">
                            <Building2 className="w-4 h-4 text-primary" />
                            Client Brand Context
                        </label>
                        {selectedClient && (
                            <Badge variant="outline" className="text-[11px] bg-primary/10 text-primary border-primary/20">
                                {selectedClient.industry || 'Active Client'}
                            </Badge>
                        )}
                    </div>
                    <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                        <SelectTrigger className="w-full bg-background">
                            <SelectValue placeholder="Select a Client Brand Context..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">🌐 Default / General (No Brand Context)</SelectItem>
                            {clients.map((c) => (
                                <SelectItem key={c.id} value={c.id}>
                                    🏢 {c.name} {c.isDefault ? '(Default)' : ''}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {selectedClient && (
                        <div className="text-xs text-muted-foreground pt-1 space-y-1 bg-muted/40 p-2 rounded">
                            {selectedClient.brandVoice && (
                                <p><strong className="text-foreground">Tone:</strong> {selectedClient.brandVoice}</p>
                            )}
                            {selectedClient.targetAudience && (
                                <p><strong className="text-foreground">Audience:</strong> {selectedClient.targetAudience}</p>
                            )}
                        </div>
                    )}
                </div>

                <div className="space-y-2 flex-shrink-0">
                    <label htmlFor="task" className="font-semibold text-sm">Overall Task / Campaign Prompt</label>
                    <Textarea 
                        id="task"
                        value={task}
                        onChange={(e) => setTask(e.target.value)}
                        placeholder="e.g., Create a high-converting landing page copy and social media rollout plan"
                        className="min-h-[80px]"
                    />
                </div>
                 <Button onClick={handleConfirmRun} disabled={isLoading} className="flex-shrink-0">
                    {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                    <Wand2 className="mr-2 h-4 w-4" />
                    )}
                    {selectedClient ? `Run for ${selectedClient.name}` : `Run Orchestration`}
                </Button>
                <div className="flex-grow bg-muted/50 rounded-lg p-4 flex flex-col min-h-0">
                    <div className="flex items-center justify-between mb-2 flex-shrink-0">
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary"/> Result</h3>
                            {selectedClient && result && (
                                <Badge variant="secondary" className="text-xs">
                                    Brand: {selectedClient.name}
                                </Badge>
                            )}
                        </div>
                        {result && !isLoading && (
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" onClick={handleCopyToClipboard}>
                                    <Copy className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={handleOpenInNewTab}>
                                    <ExternalLink className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                    <div className="relative flex-grow overflow-y-auto">
                        {isLoading && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        )}
                        {result && !isLoading && (
                           <div className="prose prose-sm dark:prose-invert max-w-none h-full">
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        code({ node, className, children, ...props }) {
                                            const match = /language-(\w+)/.exec(className || '');
                                            const codeString = String(children).replace(/\n$/, '');
                                            return match ? (
                                                <CodeBlock
                                                    language={match[1]}
                                                    value={codeString}
                                                    {...props}
                                                />
                                            ) : (
                                                <code className={className} {...props}>
                                                    {children}
                                                </code>
                                            );
                                        },
                                    }}
                                >
                                    {result}
                                </ReactMarkdown>
                            </div>
                        )}
                        {!result && !isLoading && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <p className="text-muted-foreground">The AI-generated result will appear here.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>

        <DialogFooter className="flex-shrink-0 pt-4">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    