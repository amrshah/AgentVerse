
'use client';

import EmbedBot from '@/components/app/embed-bot';
import type { ChatbotPersona } from '@/ai/flows/create-chatbot-flow';

type BotPageProps = {
    params: {
        persona: string;
    }
}

export default function BotPage({ params }: BotPageProps) {
    let decodedPersona: ChatbotPersona | null = null;
    let error = null;

    try {
        const decodedString = Buffer.from(params.persona, 'base64').toString('utf-8');
        decodedPersona = JSON.parse(decodedString);
    } catch (e) {
        error = "Could not load bot persona. The provided data is invalid.";
        console.error(e);
    }

    if (error || !decodedPersona) {
        return (
            <main className="flex items-center justify-center h-screen bg-muted">
                <div className="text-center p-8 bg-background rounded-lg shadow-md">
                    <h1 className="text-xl font-semibold text-destructive">Bot unavailable</h1>
                    <p className="text-muted-foreground mt-2">{error || "No persona data found."}</p>
                </div>
            </main>
        )
    }

    return (
        <main className="h-screen w-full bg-transparent">
           <EmbedBot persona={decodedPersona} />
        </main>
    );
}
