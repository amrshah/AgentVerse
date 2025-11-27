"use client";

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import CreateAgentDialog from "./create-agent-dialog";
import type { Agent, Tool } from "@/lib/types";

type HeaderProps = {
  availableTools: Tool[];
  onAgentCreate: (newAgent: Agent) => void;
};

export default function Header({ availableTools, onAgentCreate }: HeaderProps) {
  return (
    <header className="flex items-center justify-between p-4 border-b bg-card">
      <div className="flex items-center gap-3">
        <Icons.logo className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">AgentVerse</h1>
      </div>
      <CreateAgentDialog
        availableTools={availableTools}
        onAgentCreate={onAgentCreate}
      >
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Agent
        </Button>
      </CreateAgentDialog>
    </header>
  );
}
