
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { Agent } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, Loader2, Sparkles, Wand2 } from "lucide-react";
import { runOrchestration } from "@/ai/flows/run-orchestration";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

type OrchestrationPlanDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  teamAgents: Agent[];
  teamName: string;
};

export default function OrchestrationPlanDialog({
  isOpen,
  onOpenChange,
  teamAgents,
  teamName,
}: OrchestrationPlanDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState("");
  const [task, setTask] = useState(`Write a report on the future of AI.`);
  const { toast } = useToast();

  const handleConfirmRun = async () => {
    setIsLoading(true);
    setResult("");
    toast({
      title: "Orchestration Started",
      description: `Running team "${teamName}" with ${teamAgents.length} agent(s).`,
    });

    try {
      const agentsForFlow = teamAgents.map(a => ({ name: a.name, role: a.role, objectives: a.objectives }));
      const response = await runOrchestration({ teamName, agents: agentsForFlow, task });
      setResult(response.result);
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

  const handleClose = () => {
    onOpenChange(false);
    // Delay resetting state to allow for exit animation
    setTimeout(() => {
        setResult("");
        setIsLoading(false);
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow min-h-0">
            <div className="flex flex-col gap-4">
                <h3 className="font-semibold text-lg">Team Composition</h3>
                <div className="space-y-4 flex-grow overflow-y-auto p-1 pr-4">
                {teamAgents.map((agent) => (
                    <div key={agent.id} className="flex gap-4 p-4 rounded-lg border">
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
            <div className="flex flex-col gap-4">
                <div className="space-y-2">
                    <label htmlFor="task" className="font-semibold text-lg">Overall Task</label>
                    <Textarea 
                        id="task"
                        value={task}
                        onChange={(e) => setTask(e.target.value)}
                        placeholder="e.g., Create a marketing campaign for a new product"
                        className="min-h-[100px]"
                    />
                </div>
                 <Button onClick={handleConfirmRun} disabled={isLoading}>
                    {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                    <Wand2 className="mr-2 h-4 w-4" />
                    )}
                    Run Orchestration
                </Button>
                <div className="flex-grow bg-muted/50 rounded-lg p-4 overflow-y-auto min-h-[200px] flex flex-col">
                    <h3 className="font-semibold text-lg mb-2 flex items-center gap-2 flex-shrink-0"><Sparkles className="h-5 w-5 text-primary"/> Result</h3>
                    {isLoading && (
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    )}
                    {result && !isLoading && (
                        <div className="prose prose-sm dark:prose-invert max-w-none overflow-y-auto" dangerouslySetInnerHTML={{ __html: result.replace(/\n/g, '<br />') }} />

                    )}
                    {!result && !isLoading && (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-muted-foreground">The AI-generated result will appear here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
