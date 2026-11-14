import { useSyncExternalStore } from 'react';

let now = Date.now();
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | undefined;

const tick = () => {
  now = Date.now();
  listeners.forEach((listener) => listener());
};

/** One interval for every subscriber, running only while someone shows a time. */
const subscribe = (listener: () => void) => {
  listeners.add(listener);

  if (!timer) {
    now = Date.now();
    timer = setInterval(tick, 60_000);
  }

  return () => {
    listeners.delete(listener);

    if (!listeners.size) {
      clearInterval(timer);
      timer = undefined;
    }
  };
};

/** The current time in ms, moving on once a minute, for "4 days ago" style labels. */
export const useMinuteClock = () => useSyncExternalStore(subscribe, () => now);
