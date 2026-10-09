-- Seed User & Agency Workspace
INSERT OR IGNORE INTO users (id, name, email, email_verified, role, created_at, updated_at)
VALUES ('user-agency-demo', 'Alamia Agency Admin', 'admin@alamia.agency', 1, 'admin', strftime('%s','now'), strftime('%s','now'));

INSERT OR IGNORE INTO workspaces (id, name, slug, owner_id, plan, created_at, updated_at)
VALUES ('ws-alamia-main', 'Alamia Digital Agency', 'alamia-agency', 'user-agency-demo', 'pro', strftime('%s','now'), strftime('%s','now'));

-- Seed Multi-Client Brand Context Profiles
INSERT OR IGNORE INTO client_profiles (id, workspace_id, user_id, name, website, industry, target_audience, brand_voice, content_guidelines, keywords, knowledge_context, is_default, created_at, updated_at)
VALUES 
(
  'client-kamal-logistics',
  'ws-alamia-main',
  'user-agency-demo',
  'Kamal Express Logistics',
  'https://kamallogistics.com.pk',
  'Supply Chain & Freight Logistics',
  'B2B Importers, eCommerce merchants, FMCG distributors in Pakistan & Gulf region',
  'Authoritative, dependable, fast, and transparent. Professional B2B tone.',
  'Highlight 24/7 shipment tracking, bonded warehousing, and zero-breakage guarantee.',
  'freight forwarding, customs clearance, warehouse storage, Karachi port logistics, cold chain',
  'Kamal Express has 150+ fleet vehicles operating across Karachi, Lahore, Islamabad, and Gwadar Port.',
  1,
  strftime('%s','now'),
  strftime('%s','now')
),
(
  'client-freshbites-cafe',
  'ws-alamia-main',
  'user-agency-demo',
  'FreshBites Artisan Cafe',
  'https://freshbites.pk',
  'F&B / Gourmet Dining & Coffee',
  'Gen-Z, young professionals, foodies in Lahore & Islamabad',
  'Playful, energetic, foodie-centric, appetizing, warm and welcoming.',
  'Use emojis generously, emphasize farm-fresh local organic ingredients and specialty coffees.',
  'specialty coffee, sourdough, artisanal bakery, brunch, matcha latte',
  'Popular brunch destination known for Spanish lattes and freshly baked sourdough croissants.',
  0,
  strftime('%s','now'),
  strftime('%s','now')
),
(
  'client-apextech-cloud',
  'ws-alamia-main',
  'user-agency-demo',
  'ApexTech Cloud Solutions',
  'https://apextech.io',
  'Enterprise SaaS / Cloud Infrastructure',
  'CTOs, VPs of Engineering, Tech Leads at scale-ups and enterprises',
  'Technical, precise, confident, security-first, innovative.',
  'Avoid fluff; focus on uptime SLA (99.99%), SOC2 compliance, and latency benchmarks.',
  'Kubernetes, serverless, Cloudflare edge, microservices, zero-trust security',
  'ApexTech specializes in multi-cloud migration and serverless optimization for high-traffic apps.',
  0,
  strftime('%s','now'),
  strftime('%s','now')
);

-- Seed Subscriptions & Quota
INSERT OR IGNORE INTO subscriptions (id, user_id, plan, status, payment_provider, monthly_quota, current_usage, created_at, updated_at)
VALUES ('sub-alamia-demo', 'user-agency-demo', 'pro', 'active', 'safepay', 500, 3, strftime('%s','now'), strftime('%s','now'));
