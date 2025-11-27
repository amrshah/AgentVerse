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
    const overContainerKey = findContainer(over.id as string);
    
    if (!activeContainerKey || !overContainerKey) return;

    if (activeContainerKey === overContainerKey) {
        // Handle reordering within the same container
        setContainers(prev => {
            const container = prev[activeContainerKey];
            const oldIndex = container.agents.findIndex(a => a.id === active.id);
            const newIndex = container.agents.findIndex(a => a.id === over.id)
            if (oldIndex !== -1 && newIndex !== -1) {
                const newAgents = arrayMove(container.agents, oldIndex, newIndex);
                return {
                    ...prev,
                    [activeContainerKey]: {
                        ...container,
                        agents: newAgents
                    }
                }
            }
            return prev;
        })

    } else {
        // Handle moving between containers
        setContainers(prev => {
            const activeContainer = prev[activeContainerKey];
            const overContainer = prev[overContainerKey];
            const activeIndex = activeContainer.agents.findIndex(a => a.id === active.id);
            let overIndex = overContainer.agents.findIndex(a => a.id === over.id);
            
            if (overIndex === -1) {
                overIndex = overContainer.agents.length;
            }

            const newActiveAgents = [...activeContainer.agents];
            const [movedAgent] = newActiveAgents.splice(activeIndex, 1);
            const newOverAgents = [...overContainer.agents];
            newOverAgents.splice(overIndex, 0, movedAgent);
            
            return {
                ...prev,
                [activeContainerKey]: {
                    ...activeContainer,
                    agents: newActiveAgents
                },
                [overContainerKey]: {
                    ...overContainer,
                    agents: newOverAgents
                }
            }
        });
    }
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
          <SortableContext items={allAgents.map(a => a.id)}>
              <div className="flex flex-col md:flex-row gap-8 h-full">
                  {Object.keys(containers).map(key => (
                      <TeamColumn key={key} id={key} title={containers[key].title} agents={containers[key].agents} />
                  ))}
              </div>
          </SortableContext>
        </DndContext>
        <div className="flex justify-center gap-4 pt-4">
            <RunOrchestrationButton teamAgents={containers.team1.agents} teamName={containers.team1.title} />
            <RunOrchestrationButton teamAgents={containers.team2.agents} teamName={containers.team2.title} />
        </div>
      </main>
    </div>
  );
}
