
"use client";

import { useState } from "react";
import type { Agent } from "@/lib/types";
import { AVAILABLE_TOOLS } from "@/lib/data";
import Header from "./header";
import { CORE_AGENTS }from "@/lib/orchestration-presets";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { AgentCard } from "./agent-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { AgentRunner } from "./agent-runner";

export default function AgentsDashboard() {
  const [agents, setAgents] = useState<Agent[]>(() => 
    CORE_AGENTS.map((coreAgent) => {
      const avatar = PlaceHolderImages.find(p => p.id === coreAgent.id);
      return {
        ...coreAgent,
        constraints: '',
        tools: [],
        avatar: avatar?.imageUrl || `https://picsum.photos/seed/${coreAgent.id}/200`,
        avatarHint: avatar?.imageHint || 'abstract',
      };
    })
  );

  const handleAgentCreate = (newAgent: Agent) => {
    // This is for the main orchestration pool, we can decide if we want to add it here too.
    // setAgents(prev => [...prev, newAgent]);
    console.log("New agent created in main pool:", newAgent);
  };

  return (
    <div className="flex flex-col h-screen">
      <Header availableTools={AVAILABLE_TOOLS} onAgentCreate={handleAgentCreate} />
      <main className="flex-grow p-4 md:p-6 lg:p-8 space-y-8 overflow-y-auto">
        <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight">Core Agents</h1>
            <p className="text-lg text-muted-foreground mt-2">A collection of pre-built, specialized agents ready for any task.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {agents.map(agent => (
                <Card key={agent.id} className="flex flex-col">
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <AgentCard agent={agent} isDraggable={false}/>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-grow flex flex-col justify-between">
                         <div>
                            <CardTitle>{agent.name}</CardTitle>
                            <CardDescription className="mt-1">{agent.role}</CardDescription>
                            <p className="text-sm text-muted-foreground mt-4">
                                <strong>Objectives:</strong> {agent.objectives}
                            </p>
                        </div>
                        <AgentRunner agent={agent} />
                    </CardContent>
                </Card>
            ))}
        </div>
      </main>
    </div>
  );
}
