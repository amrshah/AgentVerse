"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Agent } from "@/lib/types";
import { Bot } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

type AgentDetailsDialogProps = {
  agent: Agent;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

export default function AgentDetailsDialog({
  agent,
  isOpen,
  onOpenChange,
}: AgentDetailsDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
            <div className="flex items-center gap-4 mb-4">
                <Avatar className="h-16 w-16">
                    <AvatarImage src={agent.avatar} alt={agent.name} />
                    <AvatarFallback>
                    <Bot className="h-8 w-8" />
                    </AvatarFallback>
                </Avatar>
                <div>
                    <DialogTitle className="text-2xl">{agent.name}</DialogTitle>
                    <DialogDescription>{agent.role}</DialogDescription>
                </div>
            </div>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
            <div>
                <h4 className="font-semibold mb-2">Objectives</h4>
                <p className="text-sm text-muted-foreground bg-secondary/50 p-3 rounded-md">{agent.objectives}</p>
            </div>
            {agent.constraints && (
                 <div>
                    <h4 className="font-semibold mb-2">Constraints</h4>
                    <p className="text-sm text-muted-foreground bg-secondary/50 p-3 rounded-md">{agent.constraints}</p>
                </div>
            )}
            <div>
                <h4 className="font-semibold mb-2">Assigned Tools</h4>
                {agent.tools.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {agent.tools.map(tool => (
                            <Badge key={tool.id} variant="secondary">{tool.name}</Badge>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">No tools assigned.</p>
                )}
            </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
