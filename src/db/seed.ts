import { db } from './index';
import { users, agents, teams, teamAgents, clientProfiles, subscriptions } from './schema';
import { eq } from 'drizzle-orm';
import { INITIAL_AGENTS } from '../lib/data';
import { ORCHESTRATION_PRESETS } from '../lib/orchestration-presets';

async function seed() {
  console.log('Seeding SQLite database...');

  // 1. Seed Demo Agency User
  const demoUserId = 'user-agency-demo';
  const existingUser = db.select().from(users).where(eq(users.id, demoUserId)).get();
  
  if (!existingUser) {
    db.insert(users).values({
      id: demoUserId,
      name: 'Alamia Agency Admin',
      email: 'admin@alamia.agency',
      emailVerified: true,
      role: 'agency',
    }).run();

    db.insert(subscriptions).values({
      id: 'sub-demo-pro',
      userId: demoUserId,
      plan: 'pro',
      status: 'active',
      paymentProvider: 'safepay',
      monthlyQuota: 500,
      currentUsage: 2,
    }).run();
    console.log('✓ Seeded Demo Agency User and Subscription');
  }

  // 2. Seed Sample Agency Client Profiles (Multi-Client Contexts)
  const clientCount = db.select().from(clientProfiles).all().length;
  if (clientCount === 0) {
    db.insert(clientProfiles).values([
      {
        id: 'client-kamal-express',
        userId: demoUserId,
        name: 'Kamal Express Logistics',
        website: 'https://kamalexpress.com',
        industry: 'Global Freight & Supply Chain Logistics',
        targetAudience: 'e-Commerce brand owners, cross-border importers, procurement directors',
        brandVoice: 'Authoritative, dependable, fast, highly professional',
        contentGuidelines: 'Always emphasize on-time delivery guarantees, zero customs hassle, and real-time tracking.',
        keywords: 'freight forwarding, customs clearance, air cargo, sea shipping, supply chain optimization',
        knowledgeContext: 'Kamal Express operates across 15+ international hubs connecting China, UAE, and Pakistan with automated customs clearance.',
        isDefault: true,
      },
      {
        id: 'client-freshbites',
        userId: demoUserId,
        name: 'FreshBites Artisan Cafe',
        website: 'https://freshbites.pk',
        industry: 'Gourmet Food & Beverage',
        targetAudience: 'Foodies, coffee enthusiasts, young professionals, families',
        brandVoice: 'Warm, delightful, appetizing, community-focused',
        contentGuidelines: 'Focus on farm-fresh organic ingredients, artisanal brewing, and cozy dining atmosphere.',
        keywords: 'specialty coffee, organic brunch, farm-to-table, artisan pastries',
        knowledgeContext: 'FreshBites roasts single-origin beans in-house and sources all dairy and produce locally.',
        isDefault: false,
      },
      {
        id: 'client-apextech',
        userId: demoUserId,
        name: 'ApexTech Cloud AI',
        website: 'https://apextech.ai',
        industry: 'Enterprise B2B SaaS & AI Automation',
        targetAudience: 'CTOs, Engineering Leads, IT Operations Managers',
        brandVoice: 'Cutting-edge, insightful, highly technical, concise',
        contentGuidelines: 'Include actionable architectures, benchmarks, and focus on SOC2 compliance and latency reduction.',
        keywords: 'cloud infrastructure, serverless AI, vector search, edge computing',
        knowledgeContext: 'ApexTech delivers sub-50ms enterprise inference pipelines with automated failover.',
        isDefault: false,
      },
    ]).run();
    console.log('✓ Seeded 3 Multi-Client Agency Profiles');
  }

  // 3. Seed Built-in Agents
  for (const agent of INITIAL_AGENTS) {
    const existing = db.select().from(agents).where(eq(agents.id, agent.id)).get();
    if (!existing) {
      db.insert(agents).values({
        id: agent.id,
        userId: demoUserId,
        name: agent.name,
        role: agent.role,
        description: agent.objectives,
        objectives: agent.objectives,
        avatar: agent.avatar,
        isCustom: false,
      }).run();
    }
  }
  console.log('✓ Seeded Built-in Agents');

  // 4. Seed Preset Teams
  for (const preset of ORCHESTRATION_PRESETS) {
    const existingTeam = db.select().from(teams).where(eq(teams.id, preset.id)).get();
    if (!existingTeam) {
      db.insert(teams).values({
        id: preset.id,
        userId: demoUserId,
        name: preset.name,
        description: preset.description,
        color: 'blue',
      }).run();

      // Assign agents
      for (let i = 0; i < preset.agents.length; i++) {
        const agent = preset.agents[i];
        const agentRecord = db.select().from(agents).where(eq(agents.name, agent.name)).get();
        if (agentRecord) {
          db.insert(teamAgents).values({
            id: `${preset.id}-${agentRecord.id}-${i}`,
            teamId: preset.id,
            agentId: agentRecord.id,
            orderIndex: i,
          }).run();
        }
      }
    }
  }
  console.log('✓ Seeded Preset Teams');
  console.log('Database seeding complete!');
}

seed().catch(console.error);
