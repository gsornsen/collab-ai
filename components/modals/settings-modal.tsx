"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDivider } from "@/components/ui/dialog";
import { useSettings } from "@/hooks/use-settings";
import { Label } from "@/components/ui/label";
import { ModeToggle } from "@/components/mode-toggle";
import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export const SettingsModal = () => {
  const settings = useSettings();
  const userSettings = useQuery(api.settings.getSettings);
  const updateSettings = useMutation(api.settings.updateSettings);
  const [appearance, setAppearance] = useState({ theme: "system" });
  const [chatgptApiKey, setChatgptApiKey] = useState("");
  const [claudeApiKey, setClaudeApiKey] = useState("");
  const [model, setModel] = useState("GPT-4o");

  useEffect(() => {
    if (userSettings) {
      setAppearance(userSettings.appearance ?? { theme: 'light' });
      setChatgptApiKey(userSettings.chatgptApiKey ?? '');
      setClaudeApiKey(userSettings.claudeApiKey ?? '');
    }
  }, [userSettings]);

  const handleSave = () => {
    updateSettings({
      appearance,
      chatgptApiKey,
      claudeApiKey,
      model,
    });
    settings.onClose();
  };

  return (
    <Dialog open={settings.isOpen} onOpenChange={settings.onClose}>
      <DialogContent className="bg-background dark:bg-[#1F1F1F] sm:max-w-[425px]">
        <DialogTitle>My Settings</DialogTitle>
        <DialogHeader>Appearance</DialogHeader>
        <span className="text-[0.8rem] text-muted-foreground">
            Customize how Collab AI looks on your device.
        </span>
        <div className="flex items-center justify-between py-4 pl-1">
          <Label htmlFor="theme" className="text-sm">Theme</Label>
          <ModeToggle />
        </div>
        <DialogDivider />
        <DialogHeader>AI</DialogHeader>
        <span className="text-[0.8rem] text-muted-foreground">
            Configure which AI providers you want to use.
        </span>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="chatgpt" className="text-right text-sm">
              ChatGPT API Key
            </Label>
            <Input
              id="chatgpt"
              type="text"
              value={chatgptApiKey}
              onChange={(e) => setChatgptApiKey(e.target.value)}
              className="col-span-3 text-sm"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="claude" className="text-right text-sm">
              Claude API Key
            </Label>
            <Input
              id="claude"
              type="text"
              value={claudeApiKey}
              onChange={(e) => setClaudeApiKey(e.target.value)}
              className="col-span-3 text-sm"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="model" className="text-right text-sm">
              Model
            </Label>
            <DropdownMenu>
              <DropdownMenuTrigger className="col-span-3 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 flex items-center justify-between">
                <span className="text-left text-sm">{model}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full">
                <DropdownMenuItem onClick={() => setModel("GPT-4o")}>GPT-4o</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setModel("Claude-Sonnet-3.5")}>Claude Sonnet 3.5</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
