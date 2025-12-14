"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface UseBrewTimerOptions {
  onTick?: (elapsed: number) => void;
  onComplete?: (elapsed: number) => void;
  targetSeconds?: number;
}

interface UseBrewTimerReturn {
  elapsed: number;
  isRunning: boolean;
  start: () => void;
  stop: () => number;
  reset: () => void;
  toggle: () => void;
  formatTime: (seconds?: number) => string;
}

export function useBrewTimer(options: UseBrewTimerOptions = {}): UseBrewTimerReturn {
  const { onTick, onComplete, targetSeconds } = options;

  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const startTimeRef = useRef<number | null>(null);
  const pausedTimeRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const hasCompletedRef = useRef(false);

  const tick = useCallback(() => {
    if (startTimeRef.current === null) return;

    const now = performance.now();
    const newElapsed = Math.floor((now - startTimeRef.current) / 1000) + pausedTimeRef.current;

    setElapsed(newElapsed);
    onTick?.(newElapsed);

    // Check for completion
    if (targetSeconds && newElapsed >= targetSeconds && !hasCompletedRef.current) {
      hasCompletedRef.current = true;
      onComplete?.(newElapsed);
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [onTick, onComplete, targetSeconds]);

  const start = useCallback(() => {
    if (isRunning) return;

    startTimeRef.current = performance.now();
    hasCompletedRef.current = false;
    setIsRunning(true);
    rafRef.current = requestAnimationFrame(tick);
  }, [isRunning, tick]);

  const stop = useCallback((): number => {
    if (!isRunning) return elapsed;

    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    pausedTimeRef.current = elapsed;
    startTimeRef.current = null;
    setIsRunning(false);

    return elapsed;
  }, [isRunning, elapsed]);

  const reset = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    startTimeRef.current = null;
    pausedTimeRef.current = 0;
    hasCompletedRef.current = false;
    setElapsed(0);
    setIsRunning(false);
  }, []);

  const toggle = useCallback(() => {
    if (isRunning) {
      stop();
    } else {
      start();
    }
  }, [isRunning, start, stop]);

  const formatTime = useCallback((seconds?: number): string => {
    const s = seconds ?? elapsed;
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, [elapsed]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return {
    elapsed,
    isRunning,
    start,
    stop,
    reset,
    toggle,
    formatTime,
  };
}
