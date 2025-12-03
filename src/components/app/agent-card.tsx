
"use client";

import * as React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Image from "next/image";
import type { Agent } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { GripVertical, Bot } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type AgentCardProps = {
  agent: Agent;
  isDraggable?: boolean;
};

export function AgentCard({ agent, isDraggable = true }: AgentCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: agent.id, disabled: !isDraggable });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 'auto',
    opacity: isDragging ? 0.7 : 1,
  };

  const cardContent = (
    <CardHeader className="flex flex-row items-center gap-4 p-4">
        {isDraggable && (
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab p-2 text-muted-foreground hover:text-foreground"
          >
            <GripVertical className="h-5 w-5" />
          </div>
        )}
        <Avatar>
          <AvatarImage src={agent.avatar} alt={agent.name} data-ai-hint={agent.avatarHint} />
          <AvatarFallback>
            <Bot />
          </AvatarFallback>
        </Avatar>
        <div className="flex-grow">
          <CardTitle className="text-lg">{agent.name}</CardTitle>
          <CardDescription>{agent.role}</CardDescription>
        </div>
      </CardHeader>
  );

  if (isDraggable) {
    return (
      <Card ref={setNodeRef} style={style} className="relative mb-4 touch-none">
        {cardContent}
      </Card>
    );
  }

  return (
    <div className="relative">
      <div className="flex flex-row items-center gap-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={agent.avatar} alt={agent.name} data-ai-hint={agent.avatarHint} />
          <AvatarFallback>
            <Bot />
          </AvatarFallback>
        </Avatar>
        <div className="flex-grow">
          <h3 className="text-xl font-bold">{agent.name}</h3>
          <p className="text-sm text-muted-foreground">{agent.role}</p>
        </div>
      </div>
    </div>
  )
}
