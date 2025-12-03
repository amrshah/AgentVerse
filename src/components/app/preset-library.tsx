
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ORCHESTRATION_PRESETS, type OrchestrationPreset } from '@/lib/orchestration-presets';
import { Play, ChevronDown, Copy } from 'lucide-react';
import OrchestrationPlanDialog from './orchestration-plan-dialog';
import type { Agent, TeamContainer } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

function PresetCard({ preset, setContainers }: { preset: OrchestrationPreset, setContainers: React.Dispatch<React.SetStateAction<{ [key: string]: TeamContainer }>> }) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const { toast } = useToast();

    const presetAgents: Agent[] = preset.agents.map((pa, index) => {
        const randomAvatar = PlaceHolderImages[Math.floor(Math.random() * PlaceHolderImages.length)];
        return {
            id: `preset-agent-${preset.id}-${index}-${Math.random()}`,
            name: pa.name,
            role: pa.role,
            objectives: pa.objectives,
            constraints: '',
            tools: [],
            avatar: randomAvatar.imageUrl,
            avatarHint: randomAvatar.imageHint,
        }
    });

    const handleClone = () => {
        const newTeamId = `team-${Date.now()}`;
        const newTeam: TeamContainer = {
            id: newTeamId,
            title: `Copy of ${preset.name}`,
            agents: presetAgents
        };
        setContainers(prev => ({ ...prev, [newTeamId]: newTeam }));
        toast({
            title: "Preset Cloned",
            description: `"${preset.name}" has been cloned to a new team. You can now customize it.`
        })
    };

    return (
        <>
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
                <Card className="flex flex-col h-full">
                    <CardHeader className="flex-row items-start justify-between gap-4">
                        <CardTitle className="text-base font-semibold">{preset.name}</CardTitle>
                         <Button onClick={() => setIsDialogOpen(true)} size="sm" className="flex-shrink-0">
                            <Play className="mr-2 h-4 w-4" />
                            Run
                        </Button>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <CardDescription className={cn('mb-4 min-h-[20px]', !isExpanded && "line-clamp-2")}>{preset.description}</CardDescription>
                         {isExpanded && (
                            <div className="space-y-2">
                                <p className="text-sm font-medium">Industry: <span className="font-normal text-muted-foreground">{preset.industry}</span></p>
                                <p className="text-sm font-medium">Agents:</p>
                                <ul className="list-disc list-inside text-sm text-muted-foreground">
                                    {preset.agents.map((agent, i) => (
                                        <li key={i}>{agent.name} <span className="text-xs">- {agent.role}</span></li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </CardContent>
                    <div className="flex flex-wrap items-center justify-end gap-2 p-4 pt-0">
                         <Button variant="outline" size="sm" onClick={handleClone} className="flex-grow sm:flex-grow-0">
                            <Copy className="mr-2 h-4 w-4" />
                            Clone Team
                        </Button>
                        <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm" className="flex-grow sm:flex-grow-0">
                                Details
                                <ChevronDown className={cn("h-4 w-4 transition-transform ml-2", isExpanded && "rotate-180")} />
                            </Button>
                        </CollapsibleTrigger>
                    </div>
                </Card>
            </Collapsible>
            <OrchestrationPlanDialog
                isOpen={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                teamAgents={presetAgents}
                teamName={preset.name}
                initialTask={preset.task}
            />
        </>
    )
}


export default function PresetLibrary({ setContainers }: { setContainers: React.Dispatch<React.SetStateAction<{ [key: string]: TeamContainer }>> }) {
  const [filter, setFilter] = useState('All');
  const industries = ['All', ...Array.from(new Set(ORCHESTRATION_PRESETS.map(p => p.industry)))];

  const filteredPresets = filter === 'All' ? ORCHESTRATION_PRESETS : ORCHESTRATION_PRESETS.filter(p => p.industry === filter);

  return (
    <section className="space-y-6 pt-4">
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 flex-wrap">
                {industries.map(industry => (
                    <Button
                        key={industry}
                        variant={filter === industry ? 'default' : 'outline'}
                        onClick={() => setFilter(industry)}
                    >
                        {industry}
                    </Button>
                ))}
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPresets.map(preset => (
                <PresetCard key={preset.id} preset={preset} setContainers={setContainers} />
            ))}
        </div>
    </section>
  );
}
