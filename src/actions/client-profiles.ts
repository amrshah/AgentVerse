'use server';

import { db } from '@/db';
import { clientProfiles } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { getCurrentSession } from '@/lib/session';

export type ClientProfileData = {
  name: string;
  website?: string;
  industry?: string;
  targetAudience?: string;
  brandVoice?: string;
  contentGuidelines?: string;
  keywords?: string;
  knowledgeContext?: string;
  isDefault?: boolean;
};

const DEFAULT_USER_ID = 'user-agency-demo';

export async function getClientProfiles(targetUserId?: string) {
  try {
    const session = await getCurrentSession();
    const effectiveUserId = session?.user?.id || targetUserId || DEFAULT_USER_ID;

    const profiles = db
      .select()
      .from(clientProfiles)
      .where(eq(clientProfiles.userId, effectiveUserId))
      .orderBy(desc(clientProfiles.isDefault), desc(clientProfiles.createdAt))
      .all();
    return profiles;
  } catch (error) {
    console.error('Error fetching client profiles:', error);
    return [];
  }
}

export async function getClientProfileById(id: string) {
  try {
    const profile = db
      .select()
      .from(clientProfiles)
      .where(eq(clientProfiles.id, id))
      .get();
    return profile || null;
  } catch (error) {
    console.error('Error fetching client profile:', error);
    return null;
  }
}

export async function createClientProfile(data: ClientProfileData) {
  try {
    const session = await getCurrentSession();
    const effectiveUserId = session?.user?.id || DEFAULT_USER_ID;

    const id = `client-${Date.now()}`;
    db.insert(clientProfiles)
      .values({
        id,
        userId: effectiveUserId,
        name: data.name,
        website: data.website || null,
        industry: data.industry || null,
        targetAudience: data.targetAudience || null,
        brandVoice: data.brandVoice || null,
        contentGuidelines: data.contentGuidelines || null,
        keywords: data.keywords || null,
        knowledgeContext: data.knowledgeContext || null,
        isDefault: data.isDefault || false,
      })
      .run();

    revalidatePath('/clients');
    revalidatePath('/');
    return { success: true, id };
  } catch (error: any) {
    console.error('Error creating client profile:', error);
    return { success: false, error: error.message };
  }
}

export async function updateClientProfile(id: string, data: Partial<ClientProfileData>) {
  try {
    const session = await getCurrentSession();
    const profile = db.select().from(clientProfiles).where(eq(clientProfiles.id, id)).get();
    if (!profile) {
      return { success: false, error: 'Client profile not found.' };
    }

    if (session?.user && profile.userId !== session.user.id && session.user.role !== 'admin') {
      return { success: false, error: 'Forbidden: You do not own this client profile.' };
    }

    db.update(clientProfiles)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(clientProfiles.id, id))
      .run();

    revalidatePath('/clients');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('Error updating client profile:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteClientProfile(id: string) {
  try {
    const session = await getCurrentSession();
    const profile = db.select().from(clientProfiles).where(eq(clientProfiles.id, id)).get();
    if (!profile) {
      return { success: false, error: 'Client profile not found.' };
    }

    if (session?.user && profile.userId !== session.user.id && session.user.role !== 'admin') {
      return { success: false, error: 'Forbidden: You do not have permission to delete this profile.' };
    }

    db.delete(clientProfiles).where(eq(clientProfiles.id, id)).run();
    revalidatePath('/clients');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting client profile:', error);
    return { success: false, error: error.message };
  }
}
