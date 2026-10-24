import type { ApolloError } from '@apollo/client';
import type { ReportMetric, ReportSource } from '@/report/types';

export interface ConversationReportKpiData {
  conversationOpen?: ReportMetric | null;
  conversationClosed?: ReportMetric | null;
  topPerformingSource?: ReportSource;
  topConvertingSource?: ReportSource;
  kpiError?: ApolloError;
  kpiLoading: boolean;
}
