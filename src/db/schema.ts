import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// ==========================================
// BetterAuth Tables
// ==========================================
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: integer('email_verified', { mode: 'boolean' }).notNull().default(false),
  image: text('image'),
  role: text('role').notNull().default('user'), // 'admin' | 'agency' | 'user'
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  token: text('token').notNull().unique(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
});

export const accounts = sqliteTable('accounts', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: integer('access_token_expires_at', { mode: 'timestamp' }),
  refreshTokenExpiresAt: integer('refresh_token_expires_at', { mode: 'timestamp' }),
  scope: text('scope'),
  password: text('password'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const verifications = sqliteTable('verifications', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// ==========================================
// Workspaces (Agency Tenants)
// ==========================================
export const workspaces = sqliteTable('workspaces', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  ownerId: text('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  plan: text('plan').notNull().default('free'), // 'free' | 'pro' | 'enterprise'
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// ==========================================
// Agency Multi-Client Profiles (Brand Contexts)
// ==========================================
export const clientProfiles = sqliteTable('client_profiles', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id'),
  userId: text('user_id').notNull(),
  name: text('name').notNull(), // e.g. "Kamal Express Logistics"
  website: text('website'),
  industry: text('industry'), // e.g. "Supply Chain & Logistics"
  targetAudience: text('target_audience'), // e.g. "B2B Importers, eCommerce retailers"
  brandVoice: text('brand_voice'), // e.g. "Authoritative, dependable, transparent"
  contentGuidelines: text('content_guidelines'), // e.g. "Highlight 24/7 support and delivery speeds"
  keywords: text('keywords'), // e.g. "freight, customs, warehouse, air cargo"
  knowledgeContext: text('knowledge_context'), // e.g. Background information, past content samples
  isDefault: integer('is_default', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// ==========================================
// Custom & Built-in Agents
// ==========================================
export const agents = sqliteTable('agents', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id'),
  userId: text('user_id'),
  name: text('name').notNull(),
  role: text('role').notNull(),
  description: text('description'),
  objectives: text('objectives').notNull(),
  avatar: text('avatar'),
  isCustom: integer('is_custom', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// ==========================================
// Agent Teams & Team Assignments
// ==========================================
export const teams = sqliteTable('teams', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id'),
  userId: text('user_id'),
  name: text('name').notNull(),
  description: text('description'),
  color: text('color').default('blue'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const teamAgents = sqliteTable('team_agents', {
  id: text('id').primaryKey(),
  teamId: text('team_id').notNull().references(() => teams.id, { onDelete: 'cascade' }),
  agentId: text('agent_id').notNull().references(() => agents.id, { onDelete: 'cascade' }),
  orderIndex: integer('order_index').notNull().default(0),
});

// ==========================================
// Orchestrations & Run History
// ==========================================
export const orchestrations = sqliteTable('orchestrations', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id'),
  userId: text('user_id').notNull(),
  clientProfileId: text('client_profile_id').references(() => clientProfiles.id, { onDelete: 'set null' }),
  clientName: text('client_name'),
  teamId: text('team_id'),
  teamName: text('team_name').notNull(),
  task: text('task').notNull(),
  result: text('result').notNull(),
  status: text('status').notNull().default('completed'), // 'completed' | 'failed'
  modelUsed: text('model_used').default('@cf/meta/llama-3.2-3b-instruct'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// ==========================================
// Subscriptions & Usage Tracking (Safepay / Lemon Squeezy / Free)
// ==========================================
export const subscriptions = sqliteTable('subscriptions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  plan: text('plan').notNull().default('free'), // 'free' | 'pro' | 'agency'
  status: text('status').notNull().default('active'),
  paymentProvider: text('payment_provider').default('safepay'), // 'safepay' | 'lemonsqueezy' | 'free'
  monthlyQuota: integer('monthly_quota').notNull().default(25), // 25 runs for free tier, 500 for pro
  currentUsage: integer('current_usage').notNull().default(0),
  periodEnd: integer('period_end', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});
