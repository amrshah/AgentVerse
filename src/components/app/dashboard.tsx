
"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
} from "@dnd-kit/sortable";

import type { Agent } from "@/lib/types";
import { INITIAL_AGENTS, AVAILABLE_TOOLS } from "@/lib/data";
import { TeamColumn } from "./team-column";
import Header from "./header";
import { RunOrchestrationButton } from "./run-orchestration-button";

type TeamContainer = {
  title: string;
  agents: Agent[];
};

export default function Dashboard() {
  const [containers, setContainers] = useState<{ [key: string]: TeamContainer }>({
    pool: { title: "Agent Pool", agents: INITIAL_AGENTS },
    team1: { title: "Research Team", agents: [] },
    team2: { title: "Creative Team", agents: [] },
  });

  const findContainer = (id: string) => {
    if (id in containers) {
      return id;
    }
    return Object.keys(containers).find((key) =>
      containers[key].agents.some((agent) => agent.id === id)
    );
  };
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;
    
    const activeContainerKey = findContainer(active.id as string);
    // This is the tricky part, `over.id` can be a container or an agent
    let overContainerKey = findContainer(over.id as string);
    if (!overContainerKey) {
        // It's not a known container, so it must be an agent, find its container
        for (const key in containers) {
            if (containers[key].agents.some(a => a.id === over.id)) {
                overContainerKey = key;
                break;
            }
        }
    }
    
    if (!activeContainerKey || !overContainerKey) return;

    setContainers(prev => {
        const newContainers = {...prev};
        const activeContainer = newContainers[activeContainerKey];
        const overContainer = newContainers[overContainerKey];
        const activeIndex = activeContainer.agents.findIndex(a => a.id === active.id);
        const activeAgent = activeContainer.agents[activeIndex];

        if (activeContainerKey === overContainerKey) {
            // Reordering within the same container
            const overIndex = overContainer.agents.findIndex(a => a.id === over.id);
            if (activeIndex !== overIndex) {
              activeContainer.agents = arrayMove(activeContainer.agents, activeIndex, overIndex);
            }
        } else {
            // Moving between containers
            // Remove from active container
            activeContainer.agents.splice(activeIndex, 1);

            // Add to over container
            let overIndex = overContainer.agents.findIndex(a => a.id === over.id);
            if (overIndex === -1) {
              // If dropping on the container itself (not on an agent), add to the end
              overIndex = overContainer.agents.length;
            }
            overContainer.agents.splice(overIndex, 0, activeAgent);
        }
        return newContainers;
    });
  };

  const handleAgentCreate = (newAgent: Agent) => {
    setContainers(prev => ({
        ...prev,
        pool: {
            ...prev.pool,
            agents: [newAgent, ...prev.pool.agents]
        }
    }));
  };

  const allAgents = Object.values(containers).flatMap(c => c.agents);

  return (
    <div className="flex flex-col h-screen">
      <Header availableTools={AVAILABLE_TOOLS} onAgentCreate={handleAgentCreate} />
      <main className="flex-grow p-4 md:p-6 lg:p-8 space-y-8">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="flex flex-col md:flex-row gap-8 h-full">
              {Object.keys(containers).map(key => (
                  <TeamColumn key={key} id={key} title={containers[key].title} agents={containers[key].agents} />
              ))}
          </div>
        </DndContext>
        <div className="flex justify-center gap-4 pt-4">
            <RunOrchestrationButton teamAgents={containers.team1.agents} teamName={containers.team1.title} />
            <RunOrchestrationButton teamAgents={containers.team2.agents} teamName={containers.team2.title} />
        </div>
      </main>
    </div>
  );
}
