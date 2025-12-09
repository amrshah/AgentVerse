
'use client';

import { useState, useRef, useEffect } from 'react';
import type { ChatbotPersona } from '@/ai/flows/create-chatbot-flow';
import { runChatbot } from '@/ai/flows/run-chatbot-flow';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bot, Loader2, MessageSquare, Send, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type EmbedBotProps = {
    persona: ChatbotPersona;
};

type ChatMessage = {
    role: 'user' | 'bot';
    content: string;
}

export default function EmbedBot({ persona }: EmbedBotProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>(() => {
        if (persona.welcomeMessage) {
            return [{ role: 'bot', content: persona.welcomeMessage }];
        }
        return [];
    });
    const [userMessage, setUserMessage] = useState("");
    const [isChatting, setIsChatting] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatHistory]);

    const handleSendMessage = async () => {
        if (!userMessage.trim()) return;

        const newUserMessage: ChatMessage = { role: 'user', content: userMessage };
        setChatHistory(prev => [...prev, newUserMessage]);
        setUserMessage("");
        setIsChatting(true);

        try {
            const response = await runChatbot({
                persona: JSON.stringify(persona),
                history: [...chatHistory, newUserMessage],
            });
            
            const botMessage: ChatMessage = { role: 'bot', content: response.message };
            setChatHistory(prev => [...prev, botMessage]);

        } catch (error) {
            console.error("Chatbot error:", error);
            const errorMessage: ChatMessage = { role: 'bot', content: "Sorry, I encountered an error. Please try again." };
            setChatHistory(prev => [...prev, errorMessage]);
        } finally {
            setIsChatting(false);
        }
    }

    if (!isOpen) {
        return (
            <div className="fixed bottom-4 right-4 z-50">
                <Button onClick={() => setIsOpen(true)} size="icon" className="w-16 h-16 rounded-full shadow-lg">
                    <MessageSquare className="h-8 w-8" />
                </Button>
            </div>
        )
    }

    return (
        <div className="fixed bottom-4 right-4 z-50 w-[90vw] max-w-sm h-[70vh] max-h-[600px] flex flex-col bg-card rounded-lg shadow-2xl border">
            <header className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-primary">
                        <AvatarFallback><Bot/></AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="font-semibold">{persona.name}</h3>
                        <p className="text-xs text-muted-foreground">Online</p>
                    </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                    <X className="h-5 w-5" />
                </Button>
            </header>
            <ScrollArea className="flex-grow p-4" ref={chatContainerRef}>
                <div className="space-y-4">
                {chatHistory.map((msg, index) => (
                    <div key={index} className={cn("flex items-start gap-3", msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                        {msg.role === 'bot' && (
                            <Avatar className="h-8 w-8">
                                <AvatarFallback><Bot/></AvatarFallback>
                            </Avatar>
                        )}
                        <div className={cn("rounded-lg px-3 py-2 max-w-xs text-sm prose prose-sm dark:prose-invert", msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary')}>
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                        </div>
                    </div>
                ))}
                {isChatting && (
                    <div className="flex items-end gap-2 justify-start">
                        <Avatar className="h-8 w-8">
                           <AvatarFallback><Bot/></AvatarFallback>
                        </Avatar>
                        <div className="rounded-lg px-3 py-2 bg-secondary">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        </div>
                    </div>
                )}
                </div>
            </ScrollArea>
            <div className="flex items-center gap-2 p-4 border-t bg-background">
                <Input 
                    value={userMessage}
                    onChange={e => setUserMessage(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    disabled={isChatting}
                    className="flex-grow"
                />
                <Button onClick={handleSendMessage} disabled={!userMessage.trim() || isChatting} size="icon">
                    <Send className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}
