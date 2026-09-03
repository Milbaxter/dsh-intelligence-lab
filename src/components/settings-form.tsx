"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { LabConfig } from "@/lib/lab/types";

export function SettingsForm({ initial }: { initial: LabConfig }) {
  const router = useRouter();
  const [config, setConfig] = useState(initial);
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function save() {
    start(async () => {
      setError(null);
      const response = await fetch("/api/lab/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const body = (await response.json()) as { error?: string };
      if (!response.ok) {
        setSaved(false);
        setError(body.error ?? "Could not save settings");
        return;
      }
      setSaved(true);
      router.refresh();
    });
  }

  return (
    <form
      className="grid gap-5 sm:grid-cols-2"
      onSubmit={(event) => {
        event.preventDefault();
        save();
      }}
    >
      <Field label="Cheap eval model">
        <Select
          value={config.evalModel}
          onValueChange={(value) => setConfig({ ...config, evalModel: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="deepseek-v4-flash">deepseek-v4-flash — default cheap/fast</SelectItem>
            <SelectItem value="deepseek-chat">deepseek-chat — also cheap</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <Field label="Meta-review model">
        <Input
          value={config.metaModel}
          onChange={(event) => setConfig({ ...config, metaModel: event.target.value })}
        />
      </Field>
      <Field label="Repeats per setup">
        <Input
          type="number"
          min={1}
          max={9}
          value={config.repeats}
          onChange={(event) => setConfig({ ...config, repeats: Number(event.target.value) })}
        />
      </Field>
      <Field label="Meta-review every N plugins">
        <Input
          type="number"
          min={2}
          max={20}
          value={config.metaEvery}
          onChange={(event) => setConfig({ ...config, metaEvery: Number(event.target.value) })}
        />
      </Field>
      <Field label="Split">
        <Select
          value={config.split}
          onValueChange={(value) =>
            setConfig({ ...config, split: value as LabConfig["split"] })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="lite50">lite50 — 50 instances, fast loop</SelectItem>
            <SelectItem value="lite100">lite100 — 100 instances</SelectItem>
            <SelectItem value="lite">lite — full 300</SelectItem>
            <SelectItem value="dev">dev — 23 instances</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <Field label="DSH profile">
        <Select
          value={config.profile}
          onValueChange={(value) =>
            setConfig({ ...config, profile: value as LabConfig["profile"] })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="headless">headless — default plugins, no UI</SelectItem>
            <SelectItem value="sdk-minimal">sdk-minimal — official bench pair of tools</SelectItem>
            <SelectItem value="web">web — full default desktop stack</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <Field label="Mode">
        <Select
          value={config.mode}
          onValueChange={(value) => setConfig({ ...config, mode: value as LabConfig["mode"] })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dry">dry — simulated scores, no API spend</SelectItem>
            <SelectItem value="live">live — real SWE-bench + DSH</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <Field label="Keep margin (percentage points)">
        <Input
          type="number"
          step="0.1"
          value={config.keepMarginPp}
          onChange={(event) => setConfig({ ...config, keepMarginPp: Number(event.target.value) })}
        />
      </Field>
      <div className="flex items-center justify-between gap-3 rounded-lg border border-border/80 px-3 py-2 sm:col-span-2">
        <div>
          <Label htmlFor="auto-commit">Commit data/ after each trial</Label>
          <p className="text-xs text-muted-foreground">
            For a self-hosted worker that should leave a git history of every keep/drop.
          </p>
        </div>
        <Switch
          id="auto-commit"
          checked={config.autoCommit}
          onCheckedChange={(checked) => setConfig({ ...config, autoCommit: Boolean(checked) })}
        />
      </div>
      <div className="sm:col-span-2 flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          Save settings
        </Button>
        {saved ? <p className="text-sm text-muted-foreground">Saved into data/experiment.json</p> : null}
        {error ? <p className="text-sm text-amber-200">{error}</p> : null}
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
