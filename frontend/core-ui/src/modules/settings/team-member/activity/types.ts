import { IUserInline } from '@/settings/team-member/types';

export interface IUserActivitySlots {
  enabled: boolean;
  slotMinutes: number;
  slots: number[];
}

export interface IActivityDay {
  date: string;
  minutes: number;
  firstAt: number | null;
  lastAt: number | null;
}

export interface IActivityBreakdown {
  days: IActivityDay[];
  // [weekday Monday-first][hour] → minutes
  heatmap: number[][];
  totalMinutes: number;
  activeDays: number;
}

export interface IUserActivityRankItem {
  activeMinutes: number;
  lastActiveAt?: string | null;
  user: IUserInline & { email?: string };
}

export interface IUserActivityDay {
  date: string;
  activeMembers: number;
  minutes: number;
}

export interface IUserActivityRanking {
  enabled: boolean;
  items: IUserActivityRankItem[];
  series: IUserActivityDay[];
}
