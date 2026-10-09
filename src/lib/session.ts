import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/db';
import { users, workspaces, subscriptions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'agency' | 'user';
  image?: string | null;
};

export type CurrentSession = {
  user: AuthUser;
  session: {
    id: string;
    userId: string;
    token: string;
    expiresAt: Date;
  };
};

/**
 * Retrieve the current authenticated session on the server.
 */
export async function getCurrentSession(): Promise<CurrentSession | null> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session || !session.user) {
      return null;
    }
    return session as unknown as CurrentSession;
  } catch (err) {
    console.error('Failed to get current session:', err);
    return null;
  }
}

/**
 * Require an authenticated session, throwing an error or redirecting.
 */
export async function requireAuth(shouldRedirect = true): Promise<CurrentSession> {
  const session = await getCurrentSession();
  if (!session) {
    if (shouldRedirect) {
      redirect('/login');
    }
    throw new Error('Unauthorized: Authentication required.');
  }
  return session;
}

/**
 * Require an admin session (role === 'admin').
 */
export async function requireAdmin(shouldRedirect = true): Promise<CurrentSession> {
  const session = await requireAuth(shouldRedirect);
  if (session.user.role !== 'admin') {
    if (shouldRedirect) {
      redirect('/?error=forbidden');
    }
    throw new Error('Forbidden: Super Admin access required.');
  }
  return session;
}

/**
 * Ensure the tenant workspace exists in D1, creating a default one if not.
 */
export async function getOrCreateUserWorkspace(userId: string, userName: string) {
  try {
    let workspace = db.select().from(workspaces).where(eq(workspaces.ownerId, userId)).get();
    if (!workspace) {
      const slug = `${userName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Math.random().toString(36).substring(2, 6)}`;
      const newWs = {
        id: `ws-${userId}`,
        name: `${userName}'s Agency`,
        slug,
        ownerId: userId,
        plan: 'free',
      };
      db.insert(workspaces).values(newWs).run();
      workspace = db.select().from(workspaces).where(eq(workspaces.id, newWs.id)).get();
    }
    return workspace;
  } catch (error) {
    console.error('Error getting/creating workspace:', error);
    return null;
  }
}

/**
 * Ensure tenant subscription exists, defaulting to free tier (25 runs).
 */
export async function getOrCreateUserSubscription(userId: string) {
  try {
    let sub = db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).get();
    if (!sub) {
      const newSub = {
        id: `sub-${userId}`,
        userId,
        plan: 'free',
        status: 'active',
        paymentProvider: 'free',
        monthlyQuota: 25,
        currentUsage: 0,
      };
      db.insert(subscriptions).values(newSub).run();
      sub = db.select().from(subscriptions).where(eq(subscriptions.id, newSub.id)).get();
    }
    return sub;
  } catch (error) {
    console.error('Error getting/creating subscription:', error);
    return null;
  }
}

/**
 * Quota check and usage increment for AI orchestration.
 */
export async function checkAndIncrementQuota(userId: string) {
  const sub = await getOrCreateUserSubscription(userId);
  if (!sub) {
    throw new Error('No active subscription found.');
  }

  if (sub.currentUsage >= sub.monthlyQuota) {
    throw new Error(
      `Monthly AI Orchestration quota reached (${sub.currentUsage}/${sub.monthlyQuota} runs used on ${sub.plan.toUpperCase()} plan). Upgrade your plan to continue.`
    );
  }

  // Increment usage in D1
  db.update(subscriptions)
    .set({
      currentUsage: sub.currentUsage + 1,
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.userId, userId))
    .run();

  return {
    currentUsage: sub.currentUsage + 1,
    monthlyQuota: sub.monthlyQuota,
    plan: sub.plan,
  };
}
