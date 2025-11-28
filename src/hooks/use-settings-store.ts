"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { GenkitConfig } from "@/lib/types";

interface SettingsState {
  settings: GenkitConfig;
  setSettings: (newSettings: Partial<GenkitConfig>) => void;
}

const defaultSettings: GenkitConfig = {
    model: 'gemini-2.5-flash',
    temperature: 0.7,
    topK: 40,
    topP: 1.0,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      setSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
    }),
    {
      name: "agentverse-settings-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
