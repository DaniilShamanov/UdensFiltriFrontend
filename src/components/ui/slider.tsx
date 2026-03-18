'use client';

import React, { useEffect, useId, useMemo, useRef, useState } from 'react';

type RangeValue = { min: number; max: number };

type RangeSliderProps = {
  min: number;
  max: number;
  step?: number;
  value?: RangeValue;
  defaultValue?: RangeValue;
  onChange?: (next: RangeValue) => void;
  onChangeEnd?: (next: RangeValue) => void;
  minDistance?: number;
  disabled?: boolean;
  label?: string;
  className?: string;
  showInputs?: boolean;
  formatValue?: (v: number) => string;
};

function clamp(n: number, a: number, b: number) {
  return Math.min(Math.max(n, a), b);
}

function roundToStep(value: number, step: number, min: number) {
  const scaled = (value - min) / step;
  const rounded = Math.round(scaled) * step + min;
  const decimals = (step.toString().split('.')[1] ?? '').length;
  return Number(rounded.toFixed(decimals));
}

export default function RangeSlider({
  min,
  max,
  step = 1,
  value,
  defaultValue,
  onChange,
  onChangeEnd,
  minDistance = 0,
  disabled = false,
  label = 'Range slider',
  className = '',
  showInputs = false,
  formatValue = (v) => String(v),
}: RangeSliderProps) {
  const id = useId();
  const trackRef = useRef<HTMLDivElement | null>(null);

  const isControlled = value !== undefined;

  const initial = useMemo<RangeValue>(() => {
    const dv = defaultValue ?? { min, max };
    return {
      min: clamp(dv.min, min, max),
      max: clamp(dv.max, min, max),
    };
  }, [defaultValue, min, max]);

  const [internal, setInternal] = useState<RangeValue>(() => initial);

  useEffect(() => {
    if (!isControlled) {
      setInternal((prev) => ({
        min: clamp(prev.min, min, max),
        max: clamp(prev.max, min, max),
      }));
    }
  }, [min, max, isControlled]);

  const current = isControlled ? value : internal;

  const normalized = useMemo(() => {
    let lo = Math.min(current.min, current.max);
    let hi = Math.max(current.min, current.max);

    lo = roundToStep(clamp(lo, min, max), step, min);
    hi = roundToStep(clamp(hi, min, max), step, min);

    if (hi - lo < minDistance) {
      const targetHi = clamp(lo + minDistance, min, max);
      hi = roundToStep(targetHi, step, min);
      if (hi - lo < minDistance) {
        const targetLo = clamp(hi - minDistance, min, max);
        lo = roundToStep(targetLo, step, min);
      }
    }

    lo = clamp(lo, min, max);
    hi = clamp(hi, min, max);

    return { min: lo, max: hi };
  }, [current.min, current.max, min, max, step, minDistance]);

  const minRef = useRef(normalized.min);
  const maxRef = useRef(normalized.max);
  useEffect(() => {
    minRef.current = normalized.min;
    maxRef.current = normalized.max;
  }, [normalized]);

  const range = Math.max(1e-9, max - min);
  const pctMin = ((normalized.min - min) / range) * 100;
  const pctMax = ((normalized.max - min) / range) * 100;

  type ActiveThumb = 'min' | 'max' | null;
  const [activeThumb, setActiveThumb] = useState<ActiveThumb>(null);
  const activeThumbRef = useRef<ActiveThumb>(null);
  const dragging = activeThumb !== null;
  const pointerIdRef = useRef<number | null>(null);

  function emit(next: RangeValue) {
    if (!isControlled) setInternal(next);
    onChange?.(next);
  }

  function emitEnd(next: RangeValue) {
    onChangeEnd?.(next);
  }

  function valueFromClientX(clientX: number) {
    const el = trackRef.current;
    if (!el) return minRef.current;
    const rect = el.getBoundingClientRect();
    const x = clamp(clientX - rect.left, 0, rect.width);
    const ratio = rect.width === 0 ? 0 : x / rect.width;
    const raw = min + ratio * (max - min);
    const snapped = roundToStep(raw, step, min);
    return clamp(snapped, min, max);
  }

  function setThumb(which: 'min' | 'max', nextValue: number, end = false) {
    if (disabled) return;

    const currentMin = minRef.current;
    const currentMax = maxRef.current;

    let nextMin = currentMin;
    let nextMax = currentMax;

    if (which === 'min') {
      const hardMax = currentMax - minDistance;
      nextMin = clamp(nextValue, min, hardMax);
      nextMin = roundToStep(nextMin, step, min);
      nextMin = clamp(nextMin, min, hardMax);
    } else {
      const hardMin = currentMin + minDistance;
      nextMax = clamp(nextValue, hardMin, max);
      nextMax = roundToStep(nextMax, step, min);
      nextMax = clamp(nextMax, hardMin, max);
    }

    const next = { min: nextMin, max: nextMax };
    emit(next);
    if (end) emitEnd(next);
  }

  function onThumbPointerDown(which: 'min' | 'max', e: React.PointerEvent<HTMLDivElement>) {
    if (disabled) return;
    e.preventDefault();
    e.stopPropagation();

    setActiveThumb(which);
    activeThumbRef.current = which;
    pointerIdRef.current = e.pointerId;
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
  }

  function onThumbPointerMove(which: 'min' | 'max', e: React.PointerEvent<HTMLDivElement>) {
    if (disabled || activeThumbRef.current !== which) return;
    e.preventDefault();

    setThumb(which, valueFromClientX(e.clientX), false);
  }

  function onThumbPointerUp(which: 'min' | 'max', e: React.PointerEvent<HTMLDivElement>) {
    if (disabled || activeThumbRef.current !== which) return;

    e.preventDefault();
    emitEnd({ min: minRef.current, max: maxRef.current });
    setActiveThumb(null);
    activeThumbRef.current = null;
    pointerIdRef.current = null;

    try {
      (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
    } catch {
      // no-op
    }
  }


  function onTrackPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (disabled) return;

    const v = valueFromClientX(e.clientX);
    const distToMin = Math.abs(v - minRef.current);
    const distToMax = Math.abs(v - maxRef.current);
    const target: ActiveThumb = distToMin <= distToMax ? 'min' : 'max';

    setActiveThumb(target);
    activeThumbRef.current = target;
    pointerIdRef.current = e.pointerId;
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    setThumb(target, v, false);
  }

  function onTrackPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (disabled || pointerIdRef.current !== e.pointerId || !activeThumbRef.current) return;
    setThumb(activeThumbRef.current, valueFromClientX(e.clientX), false);
  }

  function onTrackPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (disabled || pointerIdRef.current !== e.pointerId || !activeThumbRef.current) return;

    emitEnd({ min: minRef.current, max: maxRef.current });
    setActiveThumb(null);
    activeThumbRef.current = null;
    pointerIdRef.current = null;

    try {
      (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
    } catch {
      // no-op
    }
  }

  function onTrackClick(e: React.MouseEvent<HTMLDivElement>) {
    if (disabled || dragging) return;

    const v = valueFromClientX(e.clientX);
    const distToMin = Math.abs(v - minRef.current);
    const distToMax = Math.abs(v - maxRef.current);
    const target = distToMin <= distToMax ? 'min' : 'max';
    setThumb(target, v, true);
  }

  function onKeyDown(which: 'min' | 'max', e: React.KeyboardEvent) {
    if (disabled) return;

    const key = e.key;
    const delta =
      key === 'ArrowLeft' || key === 'ArrowDown'
        ? -step
        : key === 'ArrowRight' || key === 'ArrowUp'
          ? step
          : 0;

    if (delta !== 0) {
      e.preventDefault();
      const next = (which === 'min' ? minRef.current : maxRef.current) + delta;
      setThumb(which, next, false);
      return;
    }

    if (key === 'Home') {
      e.preventDefault();
      if (which === 'min') setThumb('min', min, false);
      else setThumb('max', minRef.current + minDistance, false);
      return;
    }

    if (key === 'End') {
      e.preventDefault();
      if (which === 'max') setThumb('max', max, false);
      else setThumb('min', maxRef.current - minDistance, false);
      return;
    }

    if (key === 'Enter' || key === ' ') {
      emitEnd({ min: minRef.current, max: maxRef.current });
    }
  }

  const inputBase =
    'w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground shadow-sm ' +
    'focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50 disabled:cursor-not-allowed';

  return (
    <div className={`w-full ${className}`}>
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          <span className="font-semibold text-primary">{formatValue(normalized.min)}</span>
          <span className="mx-2 text-muted-foreground/50">—</span>
          <span className="font-semibold text-primary">{formatValue(normalized.max)}</span>
        </div>
      </div>

      <div
        ref={trackRef}
        onClick={onTrackClick}
        onPointerDown={onTrackPointerDown}
        onPointerMove={onTrackPointerMove}
        onPointerUp={onTrackPointerUp}
        onPointerCancel={onTrackPointerUp}
        className={[
          'relative h-10 w-full select-none rounded-md',
          disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
          'touch-none',
        ].join(' ')}
      >
        <div className="absolute left-0 right-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-muted" />

        <div
          className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full bg-gradient-to-r from-secondary to-primary"
          style={{
            left: `${pctMin}%`,
            width: `${Math.max(0, pctMax - pctMin)}%`,
          }}
        />

        <div
          role="slider"
          aria-label={`${label} minimum`}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={normalized.min}
          aria-disabled={disabled}
          tabIndex={disabled ? -1 : 0}
          onPointerDown={(e) => onThumbPointerDown('min', e)}
          onPointerMove={(e) => onThumbPointerMove('min', e)}
          onPointerUp={(e) => onThumbPointerUp('min', e)}
          onPointerCancel={(e) => onThumbPointerUp('min', e)}
          onKeyDown={(e) => onKeyDown('min', e)}
          onBlur={() => emitEnd({ min: minRef.current, max: maxRef.current })}
          className={[
            'absolute top-1/2 -translate-x-1/2 -translate-y-1/2',
            'h-5 w-5 rounded-full border-2 border-primary bg-card shadow-sm',
            disabled ? 'cursor-not-allowed' : 'cursor-grab active:cursor-grabbing',
            'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50',
            activeThumb === 'min' ? 'z-20 pointer-events-auto' : dragging ? 'z-10 pointer-events-none' : 'z-10 pointer-events-auto',
          ].join(' ')}
          style={{ left: `${pctMin}%` }}
        />

        <div
          role="slider"
          aria-label={`${label} maximum`}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={normalized.max}
          aria-disabled={disabled}
          tabIndex={disabled ? -1 : 0}
          onPointerDown={(e) => onThumbPointerDown('max', e)}
          onPointerMove={(e) => onThumbPointerMove('max', e)}
          onPointerUp={(e) => onThumbPointerUp('max', e)}
          onPointerCancel={(e) => onThumbPointerUp('max', e)}
          onKeyDown={(e) => onKeyDown('max', e)}
          onBlur={() => emitEnd({ min: minRef.current, max: maxRef.current })}
          className={[
            'absolute top-1/2 -translate-x-1/2 -translate-y-1/2',
            'h-5 w-5 rounded-full border-2 border-secondary bg-card shadow-sm',
            disabled ? 'cursor-not-allowed' : 'cursor-grab active:cursor-grabbing',
            'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50',
            activeThumb === 'max' ? 'z-20 pointer-events-auto' : dragging ? 'z-10 pointer-events-none' : 'z-10 pointer-events-auto',
          ].join(' ')}
          style={{ left: `${pctMax}%` }}
        />
      </div>

      {showInputs && (
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <label htmlFor={`${id}-min`} className="mb-1 block text-xs text-muted-foreground">
              Min
            </label>
            <input
              id={`${id}-min`}
              type="number"
              inputMode="decimal"
              className={inputBase}
              disabled={disabled}
              min={min}
              max={normalized.max - minDistance}
              step={step}
              value={normalized.min}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (!Number.isFinite(v)) return;
                setThumb('min', v, false);
              }}
              onBlur={() => emitEnd({ min: minRef.current, max: maxRef.current })}
            />
          </div>

          <div>
            <label htmlFor={`${id}-max`} className="mb-1 block text-xs text-muted-foreground">
              Max
            </label>
            <input
              id={`${id}-max`}
              type="number"
              inputMode="decimal"
              className={inputBase}
              disabled={disabled}
              min={normalized.min + minDistance}
              max={max}
              step={step}
              value={normalized.max}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (!Number.isFinite(v)) return;
                setThumb('max', v, false);
              }}
              onBlur={() => emitEnd({ min: minRef.current, max: maxRef.current })}
            />
          </div>
        </div>
      )}
    </div>
  );
}
