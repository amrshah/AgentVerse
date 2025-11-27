
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Agent } from "@/lib/types";
import OrchestrationPlanDialog from "./orchestration-plan-dialog";

type RunOrchestrationButtonProps = {
  teamAgents: Agent[];
  teamName: string;
};

export function RunOrchestrationButton({ teamAgents, teamName }: RunOrchestrationButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleRunClick = () => {
    if (teamAgents.length === 0) {
      toast({
        variant: "destructive",
        title: "Cannot run orchestration",
        description: `Team "${teamName}" has no agents.`,
      });
      return;
    }
    setIsDialogOpen(true);
  };

  return (
    <>
      <Button onClick={handleRunClick} disabled={teamAgents.length === 0}>
        <Play className="mr-2 h-4 w-4" />
        Run Orchestration for {teamName}
      </Button>
      <OrchestrationPlanDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        teamAgents={teamAgents}
        teamName={teamName}
      />
    </>
  );
}
