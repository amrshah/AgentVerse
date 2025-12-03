
"use client";

import type { Agent } from "@/lib/types";
import { AVAILABLE_TOOLS } from "@/lib/data";
import Header from "./header";
import { Zap } from "lucide-react";

export default function WorkflowsDashboard() {

  const handleAgentCreate = (newAgent: Agent) => {
    // This can be adapted for the workflows page if needed.
    console.log("New agent created:", newAgent);
  };

  return (
    <div className="flex flex-col h-screen">
      <Header availableTools={AVAILABLE_TOOLS} onAgentCreate={handleAgentCreate} />
      <main className="flex-grow p-4 md:p-6 lg:p-8">
        <div className="flex flex-col items-center justify-center h-full text-center border-2 border-dashed rounded-lg bg-card">
            <div className="flex items-center justify-center w-16 h-16 mb-4 bg-primary/10 rounded-full">
                <Zap className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Automated Workflows</h1>
            <p className="text-lg text-muted-foreground mt-2 max-w-2xl">
                Define and schedule recurring agent orchestrations that run automatically. Perfect for daily reports, weekly summaries, or continuous monitoring tasks.
            </p>
            <p className="text-sm text-muted-foreground mt-8 font-semibold">Coming Soon</p>
        </div>
      </main>
    </div>
  );
}
