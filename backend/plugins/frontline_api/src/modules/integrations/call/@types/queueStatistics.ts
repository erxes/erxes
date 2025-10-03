export interface ICallQueueStatistics extends Document {
  queuechairman: string;
  queue: number;
  totalCalls: number;
  answeredCalls: number;
  answeredRate: number;
  abandonedCalls: number;
  avgWait: number;
  avgTalk: number;
  vqTotalCalls: number;
  slaRate: number;
  vqSlaRate: number;
  transferOutCalls: number;
  transferOutRate: number;
  abandonedRate: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICallQueueStatisticsDocuments
  extends ICallQueueStatistics,
    Document {}
