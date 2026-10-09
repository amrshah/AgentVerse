'use server';

import { db } from '@/db';
import { clientProfiles } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

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

export async function getClientProfiles(userId: string = DEFAULT_USER_ID) {
  try {
    const profiles = db
      .select()
      .from(clientProfiles)
      .where(eq(clientProfiles.userId, userId))
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

export async function createClientProfile(
  data: ClientProfileData,
  userId: string = DEFAULT_USER_ID
) {
  try {
    const id = `client-${Date.now()}`;
    db.insert(clientProfiles)
      .values({
        id,
        userId,
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

    revalidatePath('/');
    return { success: true, id };
  } catch (error: any) {
    console.error('Error creating client profile:', error);
    return { success: false, error: error.message };
  }
}

export async function updateClientProfile(id: string, data: Partial<ClientProfileData>) {
  try {
    db.update(clientProfiles)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(clientProfiles.id, id))
      .run();

    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('Error updating client profile:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteClientProfile(id: string) {
  try {
    db.delete(clientProfiles).where(eq(clientProfiles.id, id)).run();
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting client profile:', error);
    return { success: false, error: error.message };
  }
}
