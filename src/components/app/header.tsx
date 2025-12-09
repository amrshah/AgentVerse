
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import CreateAgentDialog from "./create-agent-dialog";
import type { Agent, Tool } from "@/lib/types";
import { cn } from "@/lib/utils";

type HeaderProps = {
  availableTools: Tool[];
  onAgentCreate: (newAgent: Agent) => void;
};

export default function Header({ availableTools, onAgentCreate }: HeaderProps) {
  const pathname = usePathname();

  return (
    <header className="flex items-center justify-between p-4 border-b bg-card">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
            <Icons.logo className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">AgentVerse</h1>
        </div>
        <nav className="flex items-center gap-2">
            <Button asChild variant={pathname === '/agents' ? 'secondary' : 'ghost'} size="sm">
                <Link href="/agents">Agents</Link>
            </Button>
            <Button asChild variant={pathname === '/' ? 'secondary' : 'ghost'} size="sm">
                <Link href="/">Orchestration</Link>
            </Button>
            <Button asChild variant={pathname === '/bot-builder' ? 'secondary' : 'ghost'} size="sm">
                <Link href="/bot-builder">Bot Builder</Link>
            </Button>
            <Button asChild variant={pathname === '/workflows' ? 'secondary' : 'ghost'} size="sm">
                <Link href="/workflows">Workflows</Link>
            </Button>
        </nav>
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
