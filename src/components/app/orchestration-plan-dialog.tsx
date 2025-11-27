
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
import { Bot, Loader2 } from "lucide-react";

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
  const { toast } = useToast();

  const handleConfirmRun = () => {
    setIsLoading(true);
    toast({
      title: "Orchestration Started",
      description: `Running team "${teamName}" with ${teamAgents.length} agent(s).`,
    });

    // Simulate orchestration process
    setTimeout(() => {
      setIsLoading(false);
      onOpenChange(false);
      toast({
        title: "Orchestration Complete",
        description: `Team "${teamName}" has finished its tasks.`,
      });
    }, 3000 + Math.random() * 2000);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Orchestration Plan for {teamName}</DialogTitle>
          <DialogDescription>
            Review the agents and their objectives before running the orchestration.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto p-1">
          {teamAgents.map((agent) => (
            <div key={agent.id} className="flex gap-4 p-4 rounded-lg border">
              <Avatar>
                <AvatarImage src={agent.avatar} alt={agent.name} />
                <AvatarFallback>
                  <Bot />
                </AvatarFallback>
              </Avatar>
              <div className="flex-grow">
                <h3 className="font-semibold">{agent.name} <span className="text-sm text-muted-foreground font-normal">- {agent.role}</span></h3>
                <p className="text-sm text-muted-foreground mt-1">
                  <strong>Objectives:</strong> {agent.objectives}
                </p>
                {agent.constraints && (
                    <p className="text-sm text-muted-foreground mt-1">
                        <strong>Constraints:</strong> {agent.constraints}
                    </p>
                )}
                {agent.tools.length > 0 && (
                     <p className="text-sm text-muted-foreground mt-1">
                        <strong>Tools:</strong> {agent.tools.map(t => t.name).join(', ')}
                    </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleConfirmRun} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Confirm and Run
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
