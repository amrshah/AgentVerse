import { config } from 'dotenv';
config();

import '@/ai/flows/create-agent-profile.ts';
import '@/ai/flows/suggest-tool-description.ts';
import '@/ai/flows/run-orchestration.ts';
import '@/ai/flows/create-chatbot-flow.ts';
import '@/ai/flows/create-supportbot-flow.ts';
import '@/ai/flows/run-agent-flow.ts';
