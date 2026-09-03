"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function IdeaForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [pitch, setPitch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit(queue: boolean) {
    setError(null);
    start(async () => {
      const res = await fetch("/api/lab/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, pitch, queue }),
      });
      if (!res.ok) {
        setError("Need both a title and a pitch.");
        return;
      }
      setTitle("");
      setPitch("");
      router.refresh();
    });
  }

  return (
    <form className="space-y-4" onSubmit={(event) => event.preventDefault()}>
      <div className="space-y-2">
        <Label htmlFor="title">Plugin idea</Label>
        <Input
          id="title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Hidden-test shadow runner"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="pitch">Why it might raise SWE-bench resolve rate</Label>
        <Textarea
          id="pitch"
          value={pitch}
          onChange={(event) => setPitch(event.target.value)}
          placeholder="Describe the behavior you want the cheap model to gain."
          rows={5}
        />
      </div>
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => submit(false)} disabled={pending}>
          Save to inbox
        </Button>
        <Button variant="outline" onClick={() => submit(true)} disabled={pending}>
          Queue for the loop
        </Button>
      </div>
    </form>
  );
}
