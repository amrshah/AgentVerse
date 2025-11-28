"use client";

import { useState, useEffect, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useSettingsStore } from "@/hooks/use-settings-store";

type SettingsDialogProps = {
  children: ReactNode;
};

const models = [
    'gemini-2.5-flash',
    'gemini-1.5-pro',
    'gemini-1.5-flash',
    'gemini-1.0-pro'
];

export function SettingsDialog({ children }: SettingsDialogProps) {
  const [open, setOpen] = useState(false);
  const { settings, setSettings } = useSettingsStore();

  // Local state to manage UI changes instantly without waiting for zustand persistence
  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = () => {
    setSettings(localSettings);
    setOpen(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>AI Agent Settings</DialogTitle>
          <DialogDescription>
            Customize the behavior of the AI agents. These settings will apply to all AI operations.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Select
              value={localSettings.model}
              onValueChange={(value) => setLocalSettings(s => ({...s, model: value}))}
            >
              <SelectTrigger id="model">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {models.map(model => (
                    <SelectItem key={model} value={model}>{model}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="temperature">Temperature: {localSettings.temperature?.toFixed(2)}</Label>
            <p className="text-sm text-muted-foreground">Controls randomness. Lower is more deterministic.</p>
            <Slider
              id="temperature"
              min={0}
              max={1}
              step={0.01}
              value={[localSettings.temperature || 0.7]}
              onValueChange={([value]) => setLocalSettings(s => ({...s, temperature: value}))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="topP">Top P: {localSettings.topP?.toFixed(2)}</Label>
             <p className="text-sm text-muted-foreground">Nucleus sampling. Considers tokens with probability mass of top_p.</p>
            <Slider
              id="topP"
              min={0}
              max={1}
              step={0.01}
              value={[localSettings.topP || 1.0]}
              onValueChange={([value]) => setLocalSettings(s => ({...s, topP: value}))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="topK">Top K: {localSettings.topK}</Label>
             <p className="text-sm text-muted-foreground">Considers the top k most likely tokens.</p>
            <Slider
              id="topK"
              min={1}
              max={100}
              step={1}
              value={[localSettings.topK || 40]}
              onValueChange={([value]) => setLocalSettings(s => ({...s, topK: value}))}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save Settings</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
