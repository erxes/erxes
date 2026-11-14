import { createContext } from 'react';
import type { FieldInfo } from './useAutomationFields';

/** What the builder needs everywhere: event types (for waits) and how each step did (last 30 days). */
export const BuilderContext = createContext<{
  events: { type: string; label: string; description?: string | null; source: string }[];
  stats: Map<string, { succeeded: number; failed: number }>;
  /** Outputs of earlier steps, by the step being edited. */
  outputsBefore: (stepId: string) => FieldInfo[];
}>({ events: [], stats: new Map(), outputsBefore: () => [] });
