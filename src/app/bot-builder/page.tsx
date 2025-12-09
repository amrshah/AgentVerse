
import BotBuilderDashboard from "@/components/app/bot-builder-dashboard";
import { AVAILABLE_TOOLS } from "@/lib/data";
import { CORE_AGENTS } from "@/lib/orchestration-presets";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import type { Agent } from "@/lib/types";

export default function BotBuilderPage() {
    // We need to pass the agent definitions to the dashboard
    // so it knows which agents to offer for bot creation.
    const agents: Agent[] = CORE_AGENTS.filter(coreAgent => 
        coreAgent.id === 'agent-lq' || coreAgent.id === 'agent-ts'
    ).map((coreAgent) => {
        const avatar = PlaceHolderImages.find(p => p.id === coreAgent.id);
        return {
            ...coreAgent,
            constraints: '',
            tools: [],
            avatar: avatar?.imageUrl || `https://picsum.photos/seed/${coreAgent.id}/200`,
            avatarHint: avatar?.imageHint || 'abstract',
        };
    });

  return (
    <main className="min-h-screen w-full">
        <BotBuilderDashboard agents={agents} />
    </main>
  );
}
