"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Loader2, Sparkles, Copy, ExternalLink, Bot, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Agent } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "../ui/textarea";
import { runAgent } from "@/ai/flows/run-agent-flow";
import { createChatbot } from "@/ai/flows/create-chatbot-flow";
import { createSupportbot } from "@/ai/flows/create-supportbot-flow";
import { runChatbot } from "@/ai/flows/run-chatbot-flow";
import { createSamContent } from "@/ai/flows/create-sam-content-flow";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CodeBlock from "./code-block";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { ScrollArea } from "../ui/scroll-area";
import { cn } from "@/lib/utils";
import { Input } from "../ui/input";

type AgentRunnerProps = {
  agent: Agent;
};

type ChatMessage = {
    role: 'user' | 'bot';
    content: string;
}

const getAgentConfig = (agentId: string) => {
    switch (agentId) {
        case 'agent-lq':
            return {
                isPersonaBuilder: true,
                isGenericRunner: false,
                isChatBot: true,
                title: (name: string) => `Configure ${name}`,
                description: "Provide a description of your business and select a role to generate a lead qualification chatbot persona.",
                inputLabel: "Business Description",
                placeholder: "e.g., A real estate agency specializing in luxury downtown condos.",
                roles: ["Friendly Assistant", "Professional Consultant", "Eager Newcomer", "Knowledgeable Expert", "Concise & To-the-point"],
                defaultRole: "Friendly Assistant",
                handler: (task: string, role: string) => createChatbot({ businessDescription: task, chatbotRole: role }),
            };
        case 'agent-ts':
            return {
                isPersonaBuilder: true,
                isGenericRunner: false,
                isChatBot: true,
                title: (name: string) => `Configure ${name}`,
                description: "Provide a description of your product or service to generate a technical support bot persona.",
                inputLabel: "Product/Service Description",
                placeholder: "e.g., A SaaS platform for project management.",
                roles: ["Patient Guide", "Efficient Expert", "Friendly Helper", "Technical & Thorough"],
                defaultRole: "Patient Guide",
                handler: (task: string, role: string) => createSupportbot({ productDescription: task, chatbotRole: role }),
            };
        case 'agent-silver-scribe':
             return {
                isPersonaBuilder: false,
                isGenericRunner: false,
                isChatBot: false,
                title: (name: string) => `Run ${name}`,
                description: "Provide a topic and the agent will generate a high-quality blog post following the SAM Editorial Excellence Guidelines.",
                inputLabel: "Blog Post Topic",
                placeholder: "e.g., The Future of AI in Digital Marketing",
                roles: [],
                defaultRole: "",
                handler: async (task: string) => createSamContent({ topic: task }),
            };
        case 'agent-jack':
             return {
                isPersonaBuilder: false,
                isGenericRunner: true,
                isChatBot: false,
                title: (name: string) => `Run ${name}`,
                description: "Define a persona for the agent and give it a task or question.",
                inputLabel: "Your Message",
                placeholder: "e.g., What are the top 5 benefits of a Mediterranean diet?",
                personaLabel: "Agent's Role / Persona",
                personaPlaceholder: "You are a world-renowned nutritionist and health expert.",
                roles: [],
                defaultRole: "",
                handler: async (task: string, persona: string, agent: Agent) => {
                    const agentForFlow = { name: agent.name, role: persona, objectives: persona };
                    const response = await runAgent({ agent: agentForFlow, task });
                    return { result: response.result }; // Ensure consistent output shape
                }
            };
        default:
            return {
                isPersonaBuilder: false,
                isGenericRunner: false,
                isChatBot: false,
                title: (name:string) => `Run Agent: ${name}`,
                description: "Provide a task for the agent to perform.",
                inputLabel: "Task",
                placeholder: "e.g., Write a blog post about the benefits of AI.",
                roles: [],
                defaultRole: "",
                handler: async (task: string, role: string, agent: Agent) => {
                    const agentForFlow = { name: agent.name, role: agent.role, objectives: agent.objectives };
                    const response = await runAgent({ agent: agentForFlow, task });
                    return { result: response.result }; // Ensure consistent output shape
                }
            };
    }
}


export function AgentRunner({ agent }: AgentRunnerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [userMessage, setUserMessage] = useState("");
  const [isChatting, setIsChatting] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  const config = getAgentConfig(agent.id);
  
  const [task, setTask] = useState("");
  const [selectedRole, setSelectedRole] = useState(config.defaultRole);
  const { toast } = useToast();

   useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleRun = async () => {
    if (!task) {
      toast({
        variant: "destructive",
        title: "Input required",
        description: `Please provide a ${config.inputLabel.toLowerCase()} for the agent.`,
      });
      return;
    }
    
    setIsLoading(true);
    setResult(null);
    setChatHistory([]);
    toast({ title: "Agent started", description: `${agent.name} is on the job.` });

    try {
      const response = await (config as any).handler(task, selectedRole, agent);
      setResult(response);

      if (config.isChatBot && response) {
        const persona = response.chatbotPersona || response.supportbotPersona;
        if (persona?.welcomeMessage) {
            setChatHistory([{ role: 'bot', content: persona.welcomeMessage }]);
        }
      }

    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Execution Failed",
        description: "Could not get a result from the agent.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!userMessage.trim()) return;

    const newUserMessage: ChatMessage = { role: 'user', content: userMessage };
    setChatHistory(prev => [...prev, newUserMessage]);
    setUserMessage("");
    setIsChatting(true);

    try {
        const persona = result.chatbotPersona || result.supportbotPersona;
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
        toast({
            variant: 'destructive',
            title: 'Chat Error',
            description: 'Could not get a response from the bot.'
        });
    } finally {
        setIsChatting(false);
    }
  }

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
        setResult(null);
        setIsLoading(false);
        setTask("");
        setSelectedRole(config.defaultRole);
        setChatHistory([]);
        setUserMessage("");
    }, 300);
  }

  const resultString = 
      result && typeof result === 'object' && result !== null && 'blogPost' in result ? (result as any).blogPost
    : result && typeof result === 'object' && result !== null && 'result' in result ? (result as any).result
    : typeof result === 'string' ? result
    : result ? JSON.stringify(result, null, 2)
    : "";

  const resultLanguage = typeof result === 'object' && result !== null && !('result' in result) && !('blogPost' in result) && result !== null ? 'json' : undefined;

  const handleOpenInNewTab = () => {
    if (!resultString) return;
    const newTabContent = `
      <html>
        <head>
          <title>Agent Result: ${task}</title>
          <style>
            body { font-family: sans-serif; line-height: 1.6; color: #e0e0e0; background-color: #1a1a1a; margin: 0; padding: 2rem 4rem; }
            .container { max-width: 800px; margin: 0 auto; }
            pre { white-space: pre-wrap; word-wrap: break-word; }
            h1, h2, h3 { color: #fff; }
            code { background-color: #333; padding: 0.2em 0.4em; border-radius: 3px; }
            pre code { padding: 0; background: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <div id="content"></div>
          </div>
          <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"><\/script>
          <script>
            document.getElementById('content').innerHTML = marked.parse(\`${resultString.replace(/`/g, '\\`')}\`);
          <\/script>
        </body>
      </html>
    `;

    const blob = new Blob([newTabContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="mt-4 w-full">
        {config.isChatBot ? <Bot className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
        {config.isChatBot ? 'Build Your Bot' : 'Run Agent'}
      </Button>
      
      <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose() }}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{config.title(agent.name)}</DialogTitle>
            <DialogDescription>{config.description}</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow overflow-y-auto p-1">
            <div className="flex flex-col gap-4">
                <div className="flex gap-4 p-4 rounded-lg border bg-background">
                    <Avatar className="h-16 w-16">
                        <AvatarImage src={agent.avatar} alt={agent.name} />
                        <AvatarFallback><Bot /></AvatarFallback>
                    </Avatar>
                    <div className="flex-grow">
                        <h4 className="font-semibold text-lg">{agent.name}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{agent.role}</p>
                    </div>
                </div>
                
                {(config as any).isGenericRunner && (
                   <div className="space-y-2">
                        <Label htmlFor="agent-persona" className="font-semibold">{(config as any).personaLabel}</Label>
                        <Textarea 
                            id="agent-persona"
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            placeholder={(config as any).personaPlaceholder}
                            className="min-h-[100px]"
                        />
                    </div>
                )}

                {config.isPersonaBuilder && (
                  <div className="space-y-2">
                    <Label htmlFor="chatbot-role">Select Role</Label>
                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                      <SelectTrigger id="chatbot-role">
                        <SelectValue placeholder="Select a role for the chatbot..." />
                      </SelectTrigger>
                      <SelectContent>
                        {config.roles.map(role => (
                          <SelectItem key={role} value={role}>{role}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                 <div className="space-y-2">
                    <Label htmlFor="task" className="font-semibold">{config.inputLabel}</Label>
                    <Textarea 
                        id="task"
                        value={task}
                        onChange={(e) => setTask(e.target.value)}
                        placeholder={config.placeholder}
                        className="min-h-[120px]"
                    />
                </div>
                <Button onClick={handleRun} disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                    {config.isChatBot ? 'Generate Persona' : 'Run'}
                </Button>
            </div>
            
            <div className="flex-grow bg-muted/50 rounded-lg p-4 flex flex-col min-h-[400px]">
                <div className="flex items-center justify-between mb-2 flex-shrink-0">
                    <h3 className="font-semibold text-lg flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary"/> Result</h3>
                    {result && !isLoading && !config.isChatBot && (
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={() => navigator.clipboard.writeText(resultString)}>
                                <Copy className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={handleOpenInNewTab}>
                                <ExternalLink className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>
                <div className="relative flex-grow overflow-y-auto">
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    )}

                    {config.isChatBot && result && !isLoading ? (
                         <div className="flex flex-col h-full">
                            <ScrollArea className="flex-grow pr-4" ref={chatContainerRef}>
                                <div className="space-y-4">
                                {chatHistory.map((msg, index) => (
                                    <div key={index} className={cn("flex items-end gap-2", msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                                        {msg.role === 'bot' && (
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={agent.avatar} alt={agent.name} />
                                                <AvatarFallback><Bot/></AvatarFallback>
                                            </Avatar>
                                        )}
                                        <div className={cn("rounded-lg px-3 py-2 max-w-sm prose prose-sm dark:prose-invert", msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-background')}>
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                                        </div>
                                    </div>
                                ))}
                                {isChatting && (
                                    <div className="flex items-end gap-2 justify-start">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={agent.avatar} alt={agent.name} />
                                            <AvatarFallback><Bot/></AvatarFallback>
                                        </Avatar>
                                        <div className="rounded-lg px-3 py-2 bg-background">
                                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                        </div>
                                    </div>
                                )}
                                </div>
                            </ScrollArea>
                            <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                                <Input 
                                    value={userMessage}
                                    onChange={e => setUserMessage(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="Type your message..."
                                    disabled={isChatting}
                                />
                                <Button onClick={handleSendMessage} disabled={!userMessage.trim() || isChatting}>
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ) : result && !isLoading ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none h-full">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    code({ node, inline, className, children, ...props }) {
                                        const match = /language-(\w+)/.exec(className || '');
                                        const lang = resultLanguage || (match ? match[1] : '');
                                        const codeString = String(children).replace(/\n$/, '');
                                        return !inline ? (
                                            <CodeBlock
                                                language={lang || 'text'}
                                                value={codeString}
                                                {...props}
                                            />
                                        ) : (
                                            <code className={className} {...props}>
                                                {children}
                                            </code>
                                        );
                                    },
                                }}
                            >
                                {resultString}
                            </ReactMarkdown>
                        </div>
                    ) : !result && !isLoading ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <p className="text-muted-foreground">The AI-generated result will appear here.</p>
                        </div>
                    ) : null}
                </div>
            </div>
          </div>
          
          <DialogFooter className="flex-shrink-0 pt-4">
            <Button variant="outline" onClick={handleClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}