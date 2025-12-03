
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "../ui/textarea";
import { runOrchestration } from "@/ai/flows/run-orchestration";
import { createChatbot } from "@/ai/flows/create-chatbot-flow";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CodeBlock from "./code-block";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

type AgentRunnerProps = {
  agent: Agent;
};

export function AgentRunner({ agent }: AgentRunnerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | object | null>(null);
  const [task, setTask] = useState("");
  const { toast } = useToast();

  const isChatbotPersonaBuilder = agent.id === 'agent-cb';
  const title = isChatbotPersonaBuilder ? `Configure ${agent.name}` : `Run Agent: ${agent.name}`;
  const description = isChatbotPersonaBuilder 
    ? "Provide a description of your business to generate a lead qualification chatbot persona."
    : "Provide a task for the agent to perform.";
  const inputLabel = isChatbotPersonaBuilder ? "Business Description" : "Task";
  const placeholder = isChatbotPersonaBuilder
    ? "e.g., A real estate agency specializing in luxury downtown condos."
    : "e.g., Write a blog post about the benefits of AI.";


  const handleRun = async () => {
    if (!task) {
      toast({
        variant: "destructive",
        title: "Input required",
        description: `Please provide a ${inputLabel.toLowerCase()} for the agent.`,
      });
      return;
    }
    
    setIsLoading(true);
    setResult(null);
    toast({ title: "Agent started", description: `${agent.name} is on the job.` });

    try {
      let response: any;
      if (isChatbotPersonaBuilder) {
        response = await createChatbot({ businessDescription: task });
      } else {
        const agentsForFlow = [{ name: agent.name, role: agent.role, objectives: agent.objectives }];
        response = await runOrchestration({ teamName: agent.name, agents: agentsForFlow, task });
      }
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
    }, 300);
  }

  const resultString = typeof result === 'string' 
      ? result 
      : result && 'result' in result ? (result as any).result
      : result ? JSON.stringify(result, null, 2) : "";

  const resultLanguage = typeof result === 'object' ? 'json' : undefined;

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="mt-4 w-full">
        <Play className="mr-2 h-4 w-4" />
        Run Agent
      </Button>
      
      <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose() }}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
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
                 <div className="space-y-2">
                    <label htmlFor="task" className="font-semibold text-base">{inputLabel}</label>
                    <Textarea 
                        id="task"
                        value={task}
                        onChange={(e) => setTask(e.target.value)}
                        placeholder={placeholder}
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
