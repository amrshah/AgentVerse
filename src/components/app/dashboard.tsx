
"use client";

import { useState, useEffect } from "react";
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
import { PlusCircle } from "lucide-react";
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
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

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
  
    const activeId = active.id as string;
    const overId = over.id as string;
  
    const activeContainerKey = findContainer(activeId);
    let overContainerKey = findContainer(overId);
  
    if (!activeContainerKey) return;
  
    // If overId is a container, we already have overContainerKey.
    // If overId is an agent, find its container.
    if (!overContainerKey) {
      for (const key in containers) {
        if (containers[key].agents.some(a => a.id === overId)) {
          overContainerKey = key;
          break;
        }
      }
    }
  
    if (!overContainerKey) return;
  
    setContainers(prev => {
      const newContainers = { ...prev };
      const activeContainer = newContainers[activeContainerKey];
      const overContainer = newContainers[overContainerKey];
  
      const activeIndex = activeContainer.agents.findIndex(a => a.id === activeId);
      const activeAgent = activeContainer.agents[activeIndex];
  
      if (!activeAgent) return prev;
  
      if (activeContainerKey === overContainerKey) {
        // Reordering within the same container
        const overAgent = overContainer.agents.find(a => a.id === overId);
        if (overAgent) {
          const overIndex = overContainer.agents.findIndex(a => a.id === overId);
          if (activeIndex !== overIndex) {
            newContainers[activeContainerKey].agents = arrayMove(activeContainer.agents, activeIndex, overIndex);
          }
        }
      } else {
        // Moving between containers
        // Remove from active container
        activeContainer.agents.splice(activeIndex, 1);
  
        // Add to over container
        const overAgent = overContainer.agents.find(a => a.id === overId);
        let overIndex;
        if (overAgent) {
          // Dropped on an agent
          overIndex = overContainer.agents.findIndex(a => a.id === overId);
        } else {
          // Dropped on the container itself
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

  const handleAddTeam = () => {
    const newTeamName = prompt("Enter a name for the new team:");
    if (newTeamName) {
      const newTeamId = `team-${Date.now()}`;
      setContainers(prev => ({
        ...prev,
        [newTeamId]: { title: newTeamName, agents: [] }
      }));
    }
  }

  const teamKeys = Object.keys(containers).filter(key => key !== 'pool');

  return (
    <div className="flex flex-col h-screen">
      <Header availableTools={AVAILABLE_TOOLS} onAgentCreate={handleAgentCreate} />
      <main className="flex-grow p-4 md:p-6 lg:p-8 space-y-8">
        {isClient ? (
            <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                <TeamColumn key="pool" id="pool" title={containers.pool.title} agents={containers.pool.agents} />
                {teamKeys.map(key => (
                    <TeamColumn key={key} id={key} title={containers[key].title} agents={containers[key].agents} />
                ))}
                <div 
                    onClick={handleAddTeam}
                    className="flex flex-col w-full bg-secondary/30 rounded-lg p-4 h-full border-2 border-dashed border-muted-foreground/50 hover:border-muted-foreground/80 hover:bg-secondary/50 cursor-pointer transition-colors justify-center items-center min-h-[400px]"
                >
                    <PlusCircle className="h-12 w-12 text-muted-foreground/80" />
                    <p className="mt-4 text-lg font-semibold text-muted-foreground/80">Add New Team</p>
                </div>
            </div>
            </DndContext>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            <TeamColumn key="pool" id="pool" title={containers.pool.title} agents={containers.pool.agents} />
            {teamKeys.map(key => (
                <TeamColumn key={key} id={key} title={containers[key].title} agents={containers[key].agents} />
            ))}
            <div className="flex flex-col w-full bg-secondary/30 rounded-lg p-4 h-full border-2 border-dashed border-muted-foreground/50 justify-center items-center min-h-[400px]">
                <PlusCircle className="h-12 w-12 text-muted-foreground/80" />
                <p className="mt-4 text-lg font-semibold text-muted-foreground/80">Add New Team</p>
            </div>
          </div>
        )}
        <div className="flex flex-wrap justify-center gap-4 pt-4">
            {teamKeys.map(key => (
                <RunOrchestrationButton key={`run-${key}`} teamAgents={containers[key].agents} teamName={containers[key].title} />
            ))}
        </div>
      </main>
    </div>
  );
}
