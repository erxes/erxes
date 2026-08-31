export interface IPollOption {
  _id: string;
  text: string;
  order?: number;
}

export interface IPollOptionResult {
  _id: string;
  text: string;
  count: number;
  percent: number;
}

export interface IPollResults {
  totalVotes: number;
  voterCount: number;
  options: IPollOptionResult[];
}

export interface IPollCreatedUser {
  _id: string;
  details?: {
    fullName?: string;
    avatar?: string;
  };
}

export interface IPoll {
  _id: string;
  title: string;
  question: string;
  channelId?: string;
  code?: string;
  options: IPollOption[];
  allowMultiselect?: boolean;
  durationHours?: number | null;
  status: string;
  sentCount?: number;
  createdAt?: string;
  createdUserId?: string;
  createdUser?: IPollCreatedUser;
  results?: IPollResults;
}

export interface IPollFormValues {
  title: string;
  question: string;
  options: { _id?: string; text: string }[];
  allowMultiselect: boolean;
  durationHours: number | null;
}

export enum PollsPageHotKeyScope {
  PollsPage = 'polls-page',
}

export const POLL_STATUS = {
  ACTIVE: 'active',
  ARCHIVED: 'archived',
} as const;

export const MAX_POLL_OPTIONS = 10;

export const POLL_DURATIONS: { label: string; value: number | null }[] = [
  { label: 'No end date', value: null },
  { label: '1 hour', value: 1 },
  { label: '4 hours', value: 4 },
  { label: '8 hours', value: 8 },
  { label: '1 day', value: 24 },
  { label: '3 days', value: 72 },
  { label: '7 days', value: 168 },
];
