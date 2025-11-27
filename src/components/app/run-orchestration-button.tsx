"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Agent } from "@/lib/types";

type RunOrchestrationButtonProps = {
  teamAgents: Agent[];
  teamName: string;
};

export function RunOrchestrationButton({ teamAgents, teamName }: RunOrchestrationButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleRun = () => {
    if (teamAgents.length === 0) {
      toast({
        variant: "destructive",
        title: "Cannot run orchestration",
        description: `Team "${teamName}" has no agents.`,
      });
      return;
    }

    setIsLoading(true);
    toast({
      title: "Orchestration Started",
      description: `Running team "${teamName}" with ${teamAgents.length} agent(s).`,
    });

    // Simulate orchestration process
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Orchestration Complete",
        description: `Team "${teamName}" has finished its tasks.`,
      });
    }, 3000 + Math.random() * 2000);
  };

  return (
    <Button onClick={handleRun} disabled={isLoading}>
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Play className="mr-2 h-4 w-4" />
      )}
      Run Orchestration
    </Button>
  );
}
