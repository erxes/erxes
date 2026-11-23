import type { ActionInfo, DataField } from '@erxes/core-contract';
import { createContext } from 'react';
import type { FieldInfo } from './useAutomationFields';

/** The event that starts runs: what it is about and the values it carries. */
export type StartingEvent = {
  /** Its event type; an app's (`app.facebook.message_received`) holds that app's records. */
  type?: string;
  label: string;
  source: string;
  record?: string | null;
  fields: DataField[];
  /** One has happened here, so erxes knows what it carries. */
  seen?: boolean;
};

/** What the builder needs everywhere: event types (for waits) and how each step did (last 30 days). */
export const BuilderContext = createContext<{
  automationId: string;
  hookAutomationId: string | undefined;
  events: {
    type: string;
    label: string;
    description?: string | null;
    source: string;
    /** The event's own values, for conditions on it. */
    fields?: DataField[];
  }[];
  stats: Map<string, { succeeded: number; failed: number }>;
  /** Outputs of earlier steps, by the step being edited. */
  outputsBefore: (stepId: string) => FieldInfo[];
  /** The trigger's event, when runs start from one. */
  trigger: StartingEvent | undefined;
  /** Whether runs are about a customer or company, whose fields steps can then use. */
  hasSubject: boolean;
  knownActions: ActionInfo[];
}>({
  automationId: '',
  hookAutomationId: undefined,
  events: [],
  stats: new Map(),
  outputsBefore: () => [],
  trigger: undefined,
  hasSubject: false,
  knownActions: [],
});
