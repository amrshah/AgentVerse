
"use client";

import { useState } from 'react';
import { ORCHESTRATION_PRESETS } from '@/lib/orchestration-presets';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import OrchestrationPlanDialog from './orchestration-plan-dialog';
import type { Agent } from '@/lib/types';
import { Badge } from '../ui/badge';

const industries = ["All", ...Array.from(new Set(ORCHESTRATION_PRESETS.map(p => p.industry)))];

export function PresetLibrary() {
  const [selectedPreset, setSelectedPreset] = useState<typeof ORCHESTRATION_PRESETS[0] | null>(null);
  const [selectedIndustry, setSelectedIndustry] = useState('All');

  const handleRunPreset = (preset: typeof ORCHESTRATION_PRESETS[0]) => {
    setSelectedPreset(preset);
  };
  
  const generateAgentsFromPreset = (preset: typeof ORCHESTRATION_PRESETS[0]): Agent[] => {
    return preset.agents.map((agent, index) => ({
        ...agent,
        id: `preset-agent-${preset.id}-${index}`,
        constraints: '',
        tools: [],
        avatar: `https://picsum.photos/seed/${preset.id}${index}/200/200`,
        avatarHint: 'robot illustration',
    }));
  }

  const filteredPresets = selectedIndustry === 'All'
    ? ORCHESTRATION_PRESETS
    : ORCHESTRATION_PRESETS.filter(p => p.industry === selectedIndustry);

  return (
    <section className="mb-12">
        <h2 className="text-3xl font-bold mb-2 text-center">Orchestration Presets</h2>
        <p className="text-muted-foreground text-center mb-6">
            Get started quickly with these pre-built agent teams for various industries.
        </p>

        <div className="flex justify-center gap-2 mb-8 flex-wrap">
            {industries.map(industry => (
                <Button
                    key={industry}
                    variant={selectedIndustry === industry ? 'default' : 'outline'}
                    onClick={() => setSelectedIndustry(industry)}
                >
                    {industry}
                </Button>
            ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPresets.map((preset) => (
                <Card key={preset.id} className="flex flex-col">
                    <CardHeader>
                        <CardTitle>{preset.name}</CardTitle>
                        <CardDescription>{preset.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                         <Badge variant="secondary">{preset.industry}</Badge>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={() => handleRunPreset(preset)} className="w-full">
                            <Play className="mr-2" />
                            Run Preset
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>

        {selectedPreset && (
            <OrchestrationPlanDialog
                isOpen={!!selectedPreset}
                onOpenChange={(isOpen) => {
                    if (!isOpen) {
                        setSelectedPreset(null);
                    }
                }}
                teamAgents={generateAgentsFromPreset(selectedPreset)}
                teamName={selectedPreset.name}
                initialTask={selectedPreset.task}
            />
        )}
    </section>
  );
}
