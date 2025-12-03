
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Loader2, Sparkles, Copy, ExternalLink, Bot } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Agent } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "../ui/textarea";
import { runOrchestration } from "@/ai/flows/run-orchestration";
import { createChatbot } from "@/ai/flows/create-chatbot-flow";
import { createSupportbot } from "@/ai/flows/create-supportbot-flow";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CodeBlock from "./code-block";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

type AgentRunnerProps = {
  agent: Agent;
};

const getAgentConfig = (agentId: string) => {
    switch (agentId) {
        case 'agent-lq':
            return {
                isPersonaBuilder: true,
                title: (name: string) => `Configure ${name}`,
                description: "Provide a description of your business and select a role to generate a lead qualification chatbot persona.",
                inputLabel: "Business Description",
                placeholder: "e.g., A real estate agency specializing in luxury downtown condos.",
                roles: ["Friendly Assistant", "Professional Consultant", "Eager Newcomer", "Knowledgeable Expert", "Concise & To-the-point"],
                defaultRole: "Friendly Assistant",
                handler: (task: string, role: string) => createChatbot({ businessDescription: task, chatbotRole: role }),
            };
        case 'agent-ts':
            return {
                isPersonaBuilder: true,
                title: (name: string) => `Configure ${name}`,
                description: "Provide a description of your product or service to generate a technical support bot persona.",
                inputLabel: "Product/Service Description",
                placeholder: "e.g., A SaaS platform for project management.",
                roles: ["Patient Guide", "Efficient Expert", "Friendly Helper", "Technical & Thorough"],
                defaultRole: "Patient Guide",
                handler: (task: string, role: string) => createSupportbot({ productDescription: task, chatbotRole: role }),
            };
        case 'agent-jack':
             return {
                isPersonaBuilder: false, // It's a different kind of builder
                isGenericRunner: true,
                title: (name: string) => `Run ${name}`,
                description: "Define a persona for the agent and give it a task or question.",
                inputLabel: "Your Message",
                placeholder: "e.g., What are the top 5 benefits of a Mediterranean diet?",
                personaLabel: "Agent's Role / Persona",
                personaPlaceholder: "You are a world-renowned nutritionist and health expert.",
                roles: [],
                defaultRole: "",
                handler: async (task: string, persona: string, agent: Agent) => {
                    const agentsForFlow = [{ name: agent.name, role: persona, objectives: persona }];
                    return await runOrchestration({ teamName: agent.name, agents: agentsForFlow, task });
                }
            };
        default:
            return {
                isPersonaBuilder: false,
                isGenericRunner: false,
                title: (name:string) => `Run Agent: ${name}`,
                description: "Provide a task for the agent to perform.",
                inputLabel: "Task",
                placeholder: "e.g., Write a blog post about the benefits of AI.",
                roles: [],
                defaultRole: "",
                handler: async (task: string, role: string, agent: Agent) => {
                    const agentsForFlow = [{ name: agent.name, role: agent.role, objectives: agent.objectives }];
                    return await runOrchestration({ teamName: agent.name, agents: agentsForFlow, task });
                }
            };
    }
}


export function AgentRunner({ agent }: AgentRunnerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | object | null>(null);
  
  const config = getAgentConfig(agent.id);
  
  const [task, setTask] = useState("");
  const [selectedRole, setSelectedRole] = useState(config.defaultRole);
  const { toast } = useToast();

  const handleRun = async () => {
    if (!task) {
      toast({
        variant: "destructive",
        title: "Input required",
        description: `Please provide a ${config.inputLabel.toLowerCase()} for the agent.`,
      });
      return;
    }
    
    setIsLoading(true);
    setResult(null);
    toast({ title: "Agent started", description: `${agent.name} is on the job.` });

    try {
      const response = await (config as any).handler(task, selectedRole, agent);
      setResult(response);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Execution Failed",
        description: "Could not get a result from the agent.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
        setResult(null);
        setIsLoading(false);
        setTask("");
        setSelectedRole(config.defaultRole);
    }, 300);
  }

  const resultString = typeof result === 'string' 
      ? result 
      : result && 'result' in result ? (result as any).result
      : result ? JSON.stringify(result, null, 2) : "";

  const resultLanguage = typeof result === 'object' && !(result && 'result' in result) ? 'json' : undefined;

  const handleOpenInNewTab = () => {
    if (!resultString) return;
    const newTabContent = `
      <html>
        <head>
          <title>Agent Result: ${task}</title>
          <style>
            body { font-family: sans-serif; line-height: 1.6; color: #e0e0e0; background-color: #1a1a1a; margin: 0; padding: 2rem 4rem; }
            .container { max-width: 800px; margin: 0 auto; }
            pre { white-space: pre-wrap; word-wrap: break-word; }
          </style>
        </head>
        <body>
          <div class="container">
            <div id="content"></div>
          </div>
          <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"><\/script>
          <script>
            document.getElementById('content').innerHTML = marked.parse(\`${resultString.replace(/`/g, '\\`')}\`);
          <\/script>
        </body>
      </html>
    `;

    const blob = new Blob([newTabContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="mt-4 w-full">
        <Play className="mr-2 h-4 w-4" />
        Run Agent
      </Button>
      
      <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose() }}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{config.title(agent.name)}</DialogTitle>
            <DialogDescription>{config.description}</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow overflow-y-auto p-1">
            <div className="flex flex-col gap-4">
                <div className="flex gap-4 p-4 rounded-lg border bg-background">
                    <Avatar className="h-16 w-16">
                        <AvatarImage src={agent.avatar} alt={agent.name} />
                        <AvatarFallback><Bot /></AvatarFallback>
                    </Avatar>
                    <div className="flex-grow">
                        <h4 className="font-semibold text-lg">{agent.name}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{agent.role}</p>
                    </div>
                </div>
                
                {(config as any).isGenericRunner && (
                   <div className="space-y-2">
                        <Label htmlFor="agent-persona" className="font-semibold">{(config as any).personaLabel}</Label>
                        <Textarea 
                            id="agent-persona"
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            placeholder={(config as any).personaPlaceholder}
                            className="min-h-[100px]"
                        />
                    </div>
                )}

                {config.isPersonaBuilder && (
                  <div className="space-y-2">
                    <Label htmlFor="chatbot-role">Select Role</Label>
                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                      <SelectTrigger id="chatbot-role">
                        <SelectValue placeholder="Select a role for the chatbot..." />
                      </SelectTrigger>
                      <SelectContent>
                        {config.roles.map(role => (
                          <SelectItem key={role} value={role}>{role}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                 <div className="space-y-2">
                    <Label htmlFor="task" className="font-semibold">{config.inputLabel}</Label>
                    <Textarea 
                        id="task"
                        value={task}
                        onChange={(e) => setTask(e.target.value)}
                        placeholder={config.placeholder}
                        className="min-h-[120px]"
                    />
                </div>
                <Button onClick={handleRun} disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                    Run
                </Button>
            </div>
            
            <div className="flex-grow bg-muted/50 rounded-lg p-4 flex flex-col min-h-[400px]">
                <div className="flex items-center justify-between mb-2 flex-shrink-0">
                    <h3 className="font-semibold text-lg flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary"/> Result</h3>
                    {result && !isLoading && (
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={() => navigator.clipboard.writeText(resultString)}>
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
                                    code({ node, inline, className, children, ...props }) {
                                        const match = /language-(\w+)/.exec(className || '');
                                        const lang = resultLanguage || (match ? match[1] : '');
                                        const codeString = String(children).replace(/\n$/, '');
                                        return !inline ? (
                                            <CodeBlock
                                                language={lang || 'text'}
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
                                {resultString}
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
          
          <DialogFooter className="flex-shrink-0 pt-4">
            <Button variant="outline" onClick={handleClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
