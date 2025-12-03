"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  Active,
  Over,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import type { Agent, Tool } from "@/lib/types";
import { AVAILABLE_TOOLS, INITIAL_AGENTS } from "@/lib/data";
import Header from "./header";
import { TeamColumn } from "./team-column";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import { RunOrchestrationButton } from "./run-orchestration-button";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "../ui/collapsible";
import { ChevronDown } from "lucide-react";
import PresetLibrary from "./preset-library";
import { useToast } from "@/hooks/use-toast";
import type { TeamContainer } from '@/lib/types';


const AGENT_POOL_ID = "agent-pool";

export default function OrchestrationDashboard() {
  const [isClient, setIsClient] = useState(false);
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const { toast } = useToast();
  
  const [containers, setContainers] = useState<{ [key: string]: TeamContainer }>({
    "team-1": {
      id: "team-1",
      title: "New Team",
      agents: [],
    },
  });
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const findContainer = (id: string): string | null => {
    if (agents.some(agent => agent.id === id)) {
      return AGENT_POOL_ID;
    }
    for (const containerId in containers) {
      if (containers[containerId].agents.some(agent => agent.id === id)) {
        return containerId;
      }
    }
    return null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
  
    const activeId = active.id as string;
    const overId = over.id as string;
  
    if (activeId === overId) return;
  
    const activeContainerId = findContainer(activeId);
    let overContainerId = findContainer(overId);
  
    if (!overContainerId) {
      if (Object.keys(containers).includes(overId) || overId === AGENT_POOL_ID) {
        overContainerId = overId;
      } else {
        return;
      }
    }
  
    if (!activeContainerId || !overContainerId || activeContainerId === overContainerId) {
      return;
    }
  
    setContainers(prev => {
        const newContainers = { ...prev };
        let sourceAgents: Agent[];
        let destinationAgents: Agent[];
        let draggedAgent: Agent | undefined;

        // Find and remove agent from source
        if (activeContainerId === AGENT_POOL_ID) {
            sourceAgents = [...agents];
            const activeIndex = sourceAgents.findIndex(a => a.id === activeId);
            if (activeIndex !== -1) {
                [draggedAgent] = sourceAgents.splice(activeIndex, 1);
                setAgents(sourceAgents);
            }
        } else {
            sourceAgents = [...newContainers[activeContainerId].agents];
            const activeIndex = sourceAgents.findIndex(a => a.id === activeId);
            if (activeIndex !== -1) {
                [draggedAgent] = sourceAgents.splice(activeIndex, 1);
                newContainers[activeContainerId] = { ...newContainers[activeContainerId], agents: sourceAgents };
            }
        }

        if (!draggedAgent) return prev;

        // Add agent to destination
        if (overContainerId === AGENT_POOL_ID) {
            setAgents(prevAgents => [...prevAgents, draggedAgent!]);
        } else {
            // This is tricky because `over` might be a container or an agent inside it.
            const overIsContainer = Object.keys(newContainers).includes(overId);
            const targetContainerId = overIsContainer ? overId : findContainer(overId)!;
            
            destinationAgents = newContainers[targetContainerId] ? [...newContainers[targetContainerId].agents] : [];

            const overIndex = destinationAgents.findIndex(a => a.id === overId);

            if (overIndex !== -1) {
                destinationAgents.splice(overIndex, 0, draggedAgent);
            } else {
                destinationAgents.push(draggedAgent); // Add to end if not over an item
            }
            newContainers[targetContainerId] = { ...newContainers[targetContainerId], agents: destinationAgents };
        }
        
        return newContainers;
    });
};
  

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
  
    if (!over) return;
  
    const activeContainerId = findContainer(active.id as string);
    const overContainerId = findContainer(over.id as string) || (Object.keys(containers).includes(over.id as string) || over.id === AGENT_POOL_ID ? over.id as string : null);
  
    if (!activeContainerId || !overContainerId || activeContainerId !== overContainerId) {
      // This means a drop happened across containers, which is handled by onDragOver
      // We just need to finalize the state. A simple re-render should suffice if state is managed well.
      // But let's sort if it's within the same container.
      return;
    }
  
    // Sort within the same container
    const items = activeContainerId === AGENT_POOL_ID ? agents : containers[activeContainerId].agents;
    const oldIndex = items.findIndex(item => item.id === active.id);
    const newIndex = items.findIndex(item => item.id === over.id);
  
    if (oldIndex !== newIndex && oldIndex !== -1 && newIndex !== -1) {
      const [movedItem] = items.splice(oldIndex, 1);
      items.splice(newIndex, 0, movedItem);
  
      if (activeContainerId === AGENT_POOL_ID) {
        setAgents([...items]);
      } else {
        setContainers(prev => ({
          ...prev,
          [activeContainerId]: { ...prev[activeContainerId], agents: [...items] }
        }));
      }
    }
  };
  
  const handleAgentCreate = (newAgent: Agent) => {
    setAgents(prev => [...prev, newAgent]);
  };

  const handleAddTeam = () => {
    const newTeamId = `team-${Date.now()}`;
    setContainers(prev => ({
      ...prev,
      [newTeamId]: { id: newTeamId, title: `Team ${Object.keys(prev).length + 1}`, agents: [] }
    }));
  };

  const handleRenameTeam = (teamId: string, newTitle: string) => {
    setContainers(prev => ({
      ...prev,
      [teamId]: { ...prev[teamId], title: newTitle }
    }));
  };

  const setContainersFromPreset = (newContainers: { [key: string]: TeamContainer }) => {
    // A simple merge. More sophisticated logic might be needed for conflicts.
    setContainers(prev => ({...prev, ...newContainers}));
  }


  if (!isClient) {
    return null; // Or a loading spinner
  }

  return (
    <div className="flex flex-col h-screen">
      <Header availableTools={AVAILABLE_TOOLS} onAgentCreate={handleAgentCreate} />
      <main className="flex-grow p-4 md:p-6 lg:p-8 space-y-8 overflow-y-auto">
        
        <Collapsible defaultOpen={false}>
          <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <span>Preset Library</span>
                <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
              </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <PresetLibrary setContainers={setContainersFromPreset} />
          </CollapsibleContent>
        </Collapsible>
        

        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
            <div className="xl:col-span-1">
              <TeamColumn id={AGENT_POOL_ID} title="Agent Pool" agents={agents} />
            </div>

            <div className="xl:col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {Object.keys(containers).map(teamId => (
                <div key={teamId} className="flex flex-col gap-4">
                  <TeamColumn
                    id={teamId}
                    title={containers[teamId].title}
                    agents={containers[teamId].agents}
                    isEditable={true}
                    onRenameTeam={(newTitle) => handleRenameTeam(teamId, newTitle)}
                  />
                  <RunOrchestrationButton teamName={containers[teamId].title} teamAgents={containers[teamId].agents} />
                </div>
              ))}
            </div>
          </div>
        </DndContext>
        
        <div className="flex justify-center">
            <Button variant="outline" onClick={handleAddTeam}>
                <Plus className="mr-2 h-4 w-4" /> Add New Team
            </Button>
        </div>
      </main>
    </div>
  );
}
