'use server';

import { db } from '@/db';
import { users, workspaces, subscriptions, accounts, sessions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

/**
 * Ensures demo user accounts and workspaces exist in D1.
 */
export async function ensureDemoAccountsExist() {
  try {
    // 1. Super Admin Account
    const superAdmin = db.select().from(users).where(eq(users.email, 'superadmin@agentverse.ai')).get();
    if (!superAdmin) {
      const adminId = 'user-superadmin';
      db.insert(users).values({
        id: adminId,
        name: 'Super Admin',
        email: 'superadmin@agentverse.ai',
        emailVerified: true,
        role: 'admin',
      }).run();

      db.insert(workspaces).values({
        id: `ws-${adminId}`,
        name: 'AgentVerse HQ',
        slug: 'agentverse-hq',
        ownerId: adminId,
        plan: 'enterprise',
      }).run();

      db.insert(subscriptions).values({
        id: `sub-${adminId}`,
        userId: adminId,
        plan: 'agency',
        status: 'active',
        paymentProvider: 'free',
        monthlyQuota: 10000,
        currentUsage: 42,
      }).run();
    }

    // 2. Agency Demo Account
    const agencyAdmin = db.select().from(users).where(eq(users.email, 'admin@alamia.agency')).get();
    if (!agencyAdmin) {
      const agencyId = 'user-agency-demo';
      db.insert(users).values({
        id: agencyId,
        name: 'Alamia Agency Admin',
        email: 'admin@alamia.agency',
        emailVerified: true,
        role: 'agency',
      }).run();

      db.insert(workspaces).values({
        id: `ws-${agencyId}`,
        name: 'Alamia Digital Agency',
        slug: 'alamia-digital',
        ownerId: agencyId,
        plan: 'pro',
      }).run();

      db.insert(subscriptions).values({
        id: `sub-${agencyId}`,
        userId: agencyId,
        plan: 'pro',
        status: 'active',
        paymentProvider: 'safepay',
        monthlyQuota: 500,
        currentUsage: 8,
      }).run();
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error ensuring demo accounts:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Server-side Demo Session Switcher for quick evaluation of roles.
 * Creates a valid session token in D1 sessions table and sets the cookie.
 */
export async function createDemoSession(role: 'admin' | 'agency') {
  await ensureDemoAccountsExist();

  const targetEmail = role === 'admin' ? 'superadmin@agentverse.ai' : 'admin@alamia.agency';
  const user = db.select().from(users).where(eq(users.email, targetEmail)).get();

  if (!user) {
    return { success: false, error: `User with email ${targetEmail} not found.` };
  }

  // Generate session token
  const token = `demo_session_${Math.random().toString(36).substring(2)}${Date.now()}`;
  const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  db.insert(sessions).values({
    id: sessionId,
    token,
    userId: user.id,
    expiresAt,
    ipAddress: '127.0.0.1',
    userAgent: 'AgentVerse Demo Portal',
  }).run();

  // Set better-auth session cookie
  const cookieStore = await cookies();
  cookieStore.set('better-auth.session_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  });

  revalidatePath('/');
  return { success: true, user };
}

/**
 * Handle new user onboarding: auto-create workspace and free subscription in D1.
 */
export async function onUserSignUpComplete(userId: string, name: string, email: string) {
  try {
    // Check if workspace exists
    const existingWs = db.select().from(workspaces).where(eq(workspaces.ownerId, userId)).get();
    if (!existingWs) {
      const slug = `${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Math.random().toString(36).substring(2, 6)}`;
      db.insert(workspaces).values({
        id: `ws-${userId}`,
        name: `${name}'s Agency`,
        slug,
        ownerId: userId,
        plan: 'free',
      }).run();
    }

    // Check if subscription exists
    const existingSub = db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).get();
    if (!existingSub) {
      db.insert(subscriptions).values({
        id: `sub-${userId}`,
        userId,
        plan: 'free',
        status: 'active',
        paymentProvider: 'free',
        monthlyQuota: 25,
        currentUsage: 0,
      }).run();
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error in onUserSignUpComplete:', error);
    return { success: false, error: error.message };
  }
}
