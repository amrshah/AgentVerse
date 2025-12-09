
"use client";

import type { Agent } from "@/lib/types";
import { AVAILABLE_TOOLS } from "@/lib/data";
import Header from "./header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { AgentRunner } from "./agent-runner";
import { Bot, MessageSquare, Handshake } from "lucide-react";

type BotBuilderDashboardProps = {
    agents: Agent[];
}

const botTypeIcons = {
    'agent-lq': <Handshake className="h-8 w-8 text-primary" />,
    'agent-ts': <Bot className="h-8 w-8 text-primary" />,
    'default': <MessageSquare className="h-8 w-8 text-primary" />
}

export default function BotBuilderDashboard({ agents }: BotBuilderDashboardProps) {

  const handleAgentCreate = (newAgent: Agent) => {
    console.log("New agent created:", newAgent);
  };

  return (
    <div className="flex flex-col h-screen">
      <Header availableTools={AVAILABLE_TOOLS} onAgentCreate={handleAgentCreate} />
      <main className="flex-grow p-4 md:p-6 lg:p-8 space-y-8 overflow-y-auto">
        <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight">Bot Builder</h1>
            <p className="text-lg text-muted-foreground mt-2 max-w-3xl mx-auto">
                Create specialized chatbots for your business. Generate a complete persona and script, then chat with your new bot to test it out.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {agents.map(agent => (
                <Card key={agent.id} className="flex flex-col">
                    <CardHeader>
                        <div className="flex items-center gap-4">
                             <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full">
                                {botTypeIcons[agent.id as keyof typeof botTypeIcons] || botTypeIcons['default']}
                            </div>
                            <div className="flex-grow">
                                <CardTitle>{agent.name}</CardTitle>
                                <CardDescription className="mt-1">{agent.objectives}</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-grow flex flex-col justify-end">
                        <AgentRunner agent={agent} />
                    </CardContent>
                </Card>
            ))}
             <Card className="flex flex-col border-dashed border-2 items-center justify-center text-center p-6">
                <div className="flex items-center justify-center w-16 h-16 mb-4 bg-muted rounded-full">
                    <MessageSquare className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-muted-foreground">More Bot Types</h3>
                <p className="text-sm text-muted-foreground mt-1">Voicebots, tech assistants, and more are coming soon.</p>
            </Card>
        </div>
      </main>
    </div>
  );
}
