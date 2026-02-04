"use client";

import * as React from "react";

import { cn } from "./utils";

export interface SliderProps {
  value?: number[];
  defaultValue?: number[];
  min?: number;
  max?: number;
  step?: number;
  onValueChange?: (value: number[]) => void;
  className?: string;
  disabled?: boolean;
}

function Slider({ value, defaultValue = [0], min = 0, max = 100, step = 1, onValueChange, className, disabled }: SliderProps) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue);
  const isControlled = Array.isArray(value);
  const current = isControlled ? (value as number[]) : uncontrolled;
  const v = current?.[0] ?? 0;

  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={v}
      disabled={disabled}
      onChange={(e) => {
        const next = [Number(e.target.value)];
        if (!isControlled) setUncontrolled(next);
        onValueChange?.(next);
      }}
      className={cn("w-full", className)}
    />
  );
}

export { Slider };
