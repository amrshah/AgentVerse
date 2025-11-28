"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { AgentCard } from "./agent-card";
import type { Agent } from "@/lib/types";
import { motion } from "framer-motion";

type TeamColumnProps = {
  id: string;
  title: string;
  agents: Agent[];
};

export function TeamColumn({ id, title, agents }: TeamColumnProps) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <motion.div 
      layout
      className="flex flex-col w-full bg-secondary/50 rounded-lg p-4 h-full min-h-[500px]"
    >
      <h2 className="text-xl font-semibold mb-4 text-center text-foreground">{title}</h2>
      <div
        ref={setNodeRef}
        className="flex-grow bg-background/50 rounded-md p-2 min-h-[400px] overflow-y-auto"
      >
        <SortableContext items={agents.map(a => a.id)} strategy={verticalListSortingStrategy}>
          {agents.length > 0 ? (
            agents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>Drag agents here</p>
            </div>
          )}
        </SortableContext>
      </div>
    </motion.div>
  );
}
