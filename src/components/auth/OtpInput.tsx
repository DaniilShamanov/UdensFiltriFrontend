"use client";

import React from "react";
import { Input } from "@/components/ui/input";

export function OtpInput({ value, onChange, length = 6 }: { value: string; onChange: (v: string) => void; length?: number }) {
  return (
    <Input
      value={value}
      onChange={(e) => {
        const next = e.target.value.replace(/\D/g, "").slice(0, length);
        onChange(next);
      }}
      placeholder={"•".repeat(length)}
      inputMode="numeric"
      autoComplete="one-time-code"
      className="text-center tracking-[0.6em] font-medium text-lg"
    />
  );
}
