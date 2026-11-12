import { type ComponentType, useSyncExternalStore } from 'react';

/**
 * Core's timeline, for plugin UIs: `<RecordTimeline type="hr.employee" id={employee.id} />`
 * shows notes, mentions, pins, reactions, logged calls and the plugin's own
 * entries for one of its records (the type must be in the plugin's manifest
 * `timelines`). The host app (core-ui) registers the component; erxes-ui is a
 * Module Federation singleton, so every plugin gets the host's.
 */
export type RecordTimelineProps = { type: string; id: string };

let registered: ComponentType<RecordTimelineProps> | null = null;
const listeners = new Set<() => void>();

export const setRecordTimeline = (component: ComponentType<RecordTimelineProps> | null) => {
  registered = component;
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);

  return () => listeners.delete(listener);
};

export const RecordTimeline = (props: RecordTimelineProps) => {
  const Component = useSyncExternalStore(
    subscribe,
    () => registered,
    () => registered,
  );

  return Component ? <Component {...props} /> : null;
};
