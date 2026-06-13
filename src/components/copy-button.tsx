"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success("Vágólapra másolva.");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Nem sikerült másolni.");
    }
  }

  return (
    <Button variant="ghost" size="icon" onClick={copy} title="Másolás">
      {copied ? (
        <Check className="h-4 w-4 text-emerald-600" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  );
}
