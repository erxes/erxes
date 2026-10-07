import { Document } from 'mongoose';

export interface ICycleProgressTotals {
  totalScope: number;
  totalStartedScope: number;
  totalCompletedScope: number;
}

export interface ICycleStatistics {
  progress?: ICycleProgressTotals;
  progressByMember?: (ICycleProgressTotals & { assigneeId?: string })[];
  progressByProject?: (ICycleProgressTotals & { projectId?: string })[];
  chartData?: {
    totalScope: number;
    chartData: { date: string; started: number; completed: number }[];
  };
}

export interface ICycle {
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  teamId: string;
  isCompleted: boolean;
  isActive: boolean;
  statistics?: ICycleStatistics;
  donePercent: number;
  unFinishedTasks: string[];
  number: number;
}

export interface ICycleDocument extends ICycle, Document {
  _id: string;
}
