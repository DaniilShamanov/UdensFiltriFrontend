"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "./utils";

type Item = { value: string; label: string; disabled?: boolean };

type SelectCtx = {
  value?: string;
  setValue: (v: string) => void;
  placeholder?: string;
  items: Item[];
  register: (item: Item) => void;
  unregister: (value: string) => void;
  disabled?: boolean;
};

const SelectContext = React.createContext<SelectCtx | null>(null);

export interface SelectProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  children: React.ReactNode;
}

function Select({ value, defaultValue, onValueChange, disabled, children }: SelectProps) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue ?? "");
  const isControlled = typeof value === "string";
  const current = isControlled ? (value as string) : uncontrolled;

  const [items, setItems] = React.useState<Item[]>([]);

  const setValue = (v: string) => {
    if (!isControlled) setUncontrolled(v);
    onValueChange?.(v);
  };

  const register = (item: Item) =>
    setItems((prev) => (prev.some((p) => p.value === item.value) ? prev : [...prev, item]));

  const unregister = (val: string) =>
    setItems((prev) => prev.filter((p) => p.value !== val));

  return (
    <SelectContext.Provider value={{ value: current, setValue, items, register, unregister, disabled }}>
      {children}
    </SelectContext.Provider>
  );
}

function SelectTrigger({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
  const ctx = React.useContext(SelectContext);
  if (!ctx) throw new Error("SelectTrigger must be used within Select");

  return (
    <div className={cn("relative", className)} data-slot="select-trigger">
      <select
        disabled={ctx.disabled}
        value={ctx.value ?? ""}
        onChange={(e) => ctx.setValue(e.target.value)}
        className={cn(
          "h-9 w-full appearance-none rounded-md border border-border bg-background px-3 pr-9 text-sm outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        )}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}

function SelectValue({ placeholder }: { placeholder?: string }) {
  const ctx = React.useContext(SelectContext);
  if (!ctx) return null;
  // We render placeholder as a disabled option. Actual label comes from options.
  if (!placeholder) return null;
  return (
    <option value="" disabled>
      {placeholder}
    </option>
  );
}

function SelectContent({ children }: { children: React.ReactNode }) {
  // Content is flattened directly into the <select>
  return <>{children}</>;
}

function SelectItem({ value, disabled, children }: { value: string; disabled?: boolean; children: React.ReactNode }) {
  const ctx = React.useContext(SelectContext);
  React.useEffect(() => {
    const label = typeof children === "string" ? children : String(value);
    ctx?.register({ value, label, disabled });
    return () => ctx?.unregister(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return (
    <option value={value} disabled={disabled}>
      {children}
    </option>
  );
}

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
