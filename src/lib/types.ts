export interface Tool {
  id: string;
  name: string;
  description: string;
  jsonSchema: string;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  objectives: string;
  constraints: string;
  avatar: string;
  avatarHint: string;
  tools: Tool[];
}

export type Team = {
  id: string;
  name: string;
  description: string;
  agents: string[];
}
