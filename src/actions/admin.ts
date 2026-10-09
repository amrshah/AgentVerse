'use server';

import { db } from '@/db';
import { users, workspaces, clientProfiles, orchestrations, subscriptions } from '@/db/schema';
import { count, eq, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function getAdminDashboardStats() {
  try {
    const allWorkspaces = db.select().from(workspaces).all();
    const allUsers = db.select().from(users).all();
    const allClients = db.select().from(clientProfiles).all();
    const allOrchestrations = db.select().from(orchestrations).orderBy(desc(orchestrations.createdAt)).all();
    const allSubscriptions = db.select().from(subscriptions).all();

    const proCount = allSubscriptions.filter(s => s.plan === 'pro' || s.plan === 'agency').length;
    const totalRuns = allOrchestrations.length;
    const estimatedTokens = totalRuns * 1850; // estimated avg tokens per multi-agent run

    // Calculate MRR in PKR & USD
    const mrrPKR = proCount * 8500; // PKR 8,500/mo for Agency Pro

    return {
      totalTenants: allWorkspaces.length || 1,
      totalUsers: allUsers.length || 1,
      totalClientBrands: allClients.length,
      totalOrchestrations: totalRuns,
      estimatedTokensUsed: estimatedTokens,
      activePaidSubscriptions: proCount,
      mrrPKR,
      workspaces: allWorkspaces,
      subscriptions: allSubscriptions,
      recentOrchestrations: allOrchestrations.slice(0, 10),
      clients: allClients,
    };
  } catch (error) {
    console.error('Error getting admin dashboard stats:', error);
    return {
      totalTenants: 1,
      totalUsers: 1,
      totalClientBrands: 0,
      totalOrchestrations: 0,
      estimatedTokensUsed: 0,
      activePaidSubscriptions: 0,
      mrrPKR: 0,
      workspaces: [],
      subscriptions: [],
      recentOrchestrations: [],
      clients: [],
    };
  }
}

export async function updateTenantPlan(userId: string, newPlan: 'free' | 'pro' | 'agency') {
  try {
    const quota = newPlan === 'agency' ? 2500 : newPlan === 'pro' ? 500 : 25;
    
    db.update(subscriptions)
      .set({
        plan: newPlan,
        monthlyQuota: quota,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.userId, userId))
      .run();

    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
