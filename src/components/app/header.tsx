
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Building2, Sparkles } from "lucide-react";
import CreateAgentDialog from "./create-agent-dialog";
import type { Agent, Tool } from "@/lib/types";
import { cn } from "@/lib/utils";

import { AVAILABLE_TOOLS } from "@/lib/data";

type HeaderProps = {
  availableTools?: Tool[];
  onAgentCreate?: (newAgent: Agent) => void;
};

export default function Header({
  availableTools = AVAILABLE_TOOLS,
  onAgentCreate = () => {},
}: HeaderProps) {
  const pathname = usePathname();

  return (
    <header className="flex items-center justify-between p-4 border-b bg-card">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <Icons.logo className="h-8 w-8 text-primary" />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-foreground">AgentVerse</h1>
              <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20 flex items-center gap-1 font-semibold">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Agency Pro
              </Badge>
            </div>
            <span className="text-[11px] text-muted-foreground">Alamia Digital Agency</span>
          </div>
        </div>
        <nav className="flex items-center gap-2">
          <Button asChild variant={pathname === '/' ? 'secondary' : 'ghost'} size="sm">
            <Link href="/">Orchestration</Link>
          </Button>
          <Button asChild variant={pathname === '/clients' ? 'secondary' : 'ghost'} size="sm">
            <Link href="/clients" className="flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5" />
              Client Brands
            </Link>
          </Button>
          <Button asChild variant={pathname === '/agents' ? 'secondary' : 'ghost'} size="sm">
            <Link href="/agents">Agents</Link>
          </Button>
          <Button asChild variant={pathname === '/bot-builder' ? 'secondary' : 'ghost'} size="sm">
            <Link href="/bot-builder">Bot Builder</Link>
          </Button>
          <Button asChild variant={pathname === '/workflows' ? 'secondary' : 'ghost'} size="sm">
            <Link href="/workflows">Workflows</Link>
          </Button>
          <Button asChild variant={pathname === '/admin' ? 'secondary' : 'ghost'} size="sm">
            <Link href="/admin">Admin</Link>
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
