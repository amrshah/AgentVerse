
import type { Agent, Tool } from './types';
import { PlaceHolderImages } from './placeholder-images';

export const AVAILABLE_TOOLS: Tool[] = [
  {
    id: 'tool-1',
    name: 'Web Search',
    description: 'A tool for searching the web for information.',
    jsonSchema: JSON.stringify({
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The search query.',
        },
      },
      required: ['query'],
    }, null, 2),
  },
  {
    id: 'tool-2',
    name: 'Calculator',
    description: 'A tool for performing mathematical calculations.',
    jsonSchema: JSON.stringify({
      type: 'object',
      properties: {
        expression: {
          type: 'string',
          description: 'The mathematical expression to evaluate.',
        },
      },
      required: ['expression'],
    }, null, 2),
  },
  {
    id: 'tool-3',
    name: 'File System Access',
    description: 'A tool for reading and writing files on the local file system.',
    jsonSchema: JSON.stringify({
      type: 'object',
      properties: {
        operation: {
          type: 'string',
          enum: ['read', 'write'],
        },
        path: {
          type: 'string',
          description: 'The path to the file.',
        },
        content: {
          type: 'string',
          description: 'The content to write to the file (only for write operation).',
        },
      },
      required: ['operation', 'path'],
    }, null, 2),
  },
];

export const INITIAL_AGENTS: Agent[] = [
  {
    id: 'agent-1',
    name: 'ResearchBot',
    role: 'Lead Researcher',
    objectives: 'Gather, analyze, and synthesize information from various web sources to provide comprehensive reports on given topics.',
    constraints: 'Must cite all sources and only use publicly available information. Avoid paywalled content.',
    avatar: PlaceHolderImages.find(p => p.id === 'agent-1')?.imageUrl || '',
    avatarHint: PlaceHolderImages.find(p => p.id === 'agent-1')?.imageHint || '',
    tools: [AVAILABLE_TOOLS[0]],
  },
  {
    id: 'agent-2',
    name: 'WriterBot',
    role: 'Content Creator',
    objectives: 'Generate high-quality, engaging, and well-structured articles based on the information provided by ResearchBot.',
    constraints: 'Maintain a neutral and objective tone. All generated content must be original and pass plagiarism checks.',
    avatar: PlaceHolderImages.find(p => p.id === 'agent-2')?.imageUrl || '',
    avatarHint: PlaceHolderImages.find(p => p.id === 'agent-2')?.imageHint || '',
    tools: [],
  },
  {
    id: 'agent-3',
    name: 'CodeBot',
    role: 'Software Engineer',
    objectives: 'Write, debug, and optimize code snippets based on user requirements. Can perform calculations and file operations.',
    constraints: 'Code must be well-commented and follow standard coding practices. Must not execute any harmful code.',
    avatar: PlaceHolderImages.find(p => p.id === 'agent-3')?.imageUrl || '',
    avatarHint: PlaceHolderImages.find(p => p.id === 'agent-3')?.imageHint || '',
    tools: [AVAILABLE_TOOLS[1], AVAILABLE_TOOLS[2]],
  },
   {
    id: 'agent-4',
    name: 'ManagerBot',
    role: 'Project Manager',
    objectives: 'Oversee the project, delegate tasks to other agents, and ensure the project goals are met on time.',
    constraints: 'Must provide clear and concise instructions to other agents. Tracks progress and resolves conflicts.',
    avatar: PlaceHolderImages.find(p => p.id === 'agent-4')?.imageUrl || '',
    avatarHint: PlaceHolderImages.find(p => p.id === 'agent-4')?.imageHint || '',
    tools: [],
  },
  {
    id: 'agent-jack',
    name: 'Jack of All Trades',
    role: 'Your configurable, on-the-fly conversational assistant.',
    objectives: 'Assumes any persona or expertise defined by the user to answer questions and perform conversational tasks.',
    avatar: PlaceHolderImages.find(p => p.id === 'agent-jack')?.imageUrl || '',
    avatarHint: PlaceHolderImages.find(p => p.id === 'agent-jack')?.imageHint || '',
    tools: [],
  },
  {
    id: 'agent-lq',
    name: 'Lead Qualification Bot',
    role: 'Generates a chatbot persona for qualifying leads.',
    objectives: 'Create a persona and script for a lead qualification chatbot based on a business description.',
    constraints: 'The chatbot script should be friendly, concise, and designed to gather key information from potential customers.',
    avatar: PlaceHolderImages.find(p => p.id === 'agent-lq')?.imageUrl || '',
    avatarHint: PlaceHolderImages.find(p => p.id === 'agent-lq')?.imageHint || '',
    tools: [],
  },
  {
    id: 'agent-ts',
    name: 'Technical Support Bot',
    role: 'Generates a chatbot persona for technical support.',
    objectives: 'Create a persona and script for a technical support chatbot based on a product description.',
    constraints: 'The chatbot script should be patient, clear, and designed to diagnose and solve common user issues.',
    avatar: PlaceHolderImages.find(p => p.id === 'agent-ts')?.imageUrl || '',
    avatarHint: PlaceHolderImages.find(p => p.id === 'agent-ts')?.imageHint || '',
    tools: [],
  },
  {
    id: 'agent-silver-scribe',
    name: 'Silver Scribe',
    role: 'Generates expert blog content following strict editorial guidelines.',
    objectives: 'Produce authoritative, consultant-grade blog posts for a full-service digital marketing agency.',
    constraints: 'Must strictly adhere to the SAM Editorial Excellence Guidelines, focusing on expertise, practicality, and leadership.',
    avatar: PlaceHolderImages.find(p => p.id === 'agent-silver-scribe')?.imageUrl || '',
    avatarHint: PlaceHolderImages.find(p => p.id === 'agent-silver-scribe')?.imageHint || '',
    tools: [],
  }
];
