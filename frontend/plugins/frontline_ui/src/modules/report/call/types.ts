/** Call Reports — shared TypeScript types */

export interface KpiScorecard {
  callstotal: number;
  serviceLevel: number;
  abandonment: number;
  averageSpeed: number;
  averageAnsweredTime: number;
  firstCallResolution: number | null;
  occupancy: number | null;
}

export interface VolumePoint {
  day: string;
  incoming: number;
  outgoing: number;
  answered: number;
  abandoned: number;
}

export interface CarrierSlice {
  name: string;
  value: number;
}

export interface HeatCell {
  dow: number;
  hour: number;
  total: number;
  answered: number;
  answerRate: number;
}

export interface TopNumber {
  number: string;
  carrier: string;
  attempts: number;
  answered: number;
  missed: number;
  duration: number;
}

export interface CallbackStat {
  queue: string;
  totalMissedCalls: number;
  callbackAttempts: number;
  successfulCallbacks: number;
  callbackRate: number;
  pendingCallbacks: number;
  averageCallbackTime: number;
}

export interface QueueStat {
  queue: string;
  totalCalls: number;
  answeredCalls: number;
  answeredRate: number;
  abandonedCalls: number;
  abandonedRate: number;
  averageWaitTime: number;
  averageTalkTime: number;
}

export interface AgentStat {
  agent: string;
  agentName?: string;
  totalCalls: number;
  answeredCalls: number;
  answeredRate: number;
  missedCalls: number;
  missedRate: number;
  totalTalkTime: number;
  averageTalkTime: number;
  totalWaitTime: number;
  averageWaitTime: number;
  shortestCall: number;
  longestCall: number;
}

/** Normalised integration entry (phone numbers may be comma-joined). */
export interface Integration {
  inboxId: string;
  phone: string;
  [key: string]: unknown;
}

/** Option shape used by Select dropdowns. */
export interface SelectOption {
  label: string;
  value: string;
}

/** The global filter state shared across all sections. */
export interface CallFilters {
  integrationId: string;
  setIntegrationId: (id: string) => void;
  queueId: string;
  setQueueId: (id: string) => void;
  direction: string;
  setDirection: (d: string) => void;
  dateFilter: string;
  setDateFilter: (v: string) => void;
  /** Derived ISO date strings, ready to pass to GraphQL queries */
  startDate: string;
  endDate: string;
  /** Human-readable label for current date range */
  dateRangeLabel: string;
}
