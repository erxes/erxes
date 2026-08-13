export interface KpiScorecard {
  callstotal: number;

  abandonment: number | null;
  averageAnsweredTime: number | null;

  serviceLevel: number | null;

  averageSpeed: number | null;
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

export interface Integration {
  inboxId: string;
  phone: string;
  [key: string]: unknown;
}

export interface SelectOption {
  label: string;
  value: string;
}

export interface CallFilters {
  integrationId: string;
  setIntegrationId: (id: string) => void;
  queueId: string;
  setQueueId: (id: string) => void;
  direction: string;
  setDirection: (d: string) => void;
  dateFilter: string;
  setDateFilter: (v: string) => void;

  startDate: string;
  endDate: string;

  dateRangeLabel: string;
}

export interface CallHistoryEntry {
  uniqueid: string;
  startedAt: string | null;
  endedAt: string | null;
  customerPhone: string | null;

  customerName: string | null;
  customerId: string | null;
  carrier: string;
  direction: 'incoming' | 'outgoing';

  outcome: string;
  isAnswered: boolean;

  waitTime: number | null;
  talkTime: number;
  agentExtension: string | null;
  agentName: string | null;
  rungCount: number;
  queue: string | null;
  recordUrl: string | null;
  conversationId: string | null;
  repeatCount: number;
  repeatAnswered: number;
}

export interface CallHistoryAgent {
  extension: string;
  name: string | null;
}

export interface CallHistoryPage {
  entries: CallHistoryEntry[];
  totalCount: number;
  callerCount: number;

  agents: CallHistoryAgent[];
}
