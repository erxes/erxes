import { Icon } from '@tabler/icons-react';
import { IUser } from 'ui-modules';

export interface ReportMetric {
  count: number;
  percentage: number;
}

export interface ReportSource {
  _id: string;
  name: string;
  count: number;
  percentage: number;
}

export interface CardConfig {
  id: string;
  colSpan: 1 | 2;
}

export interface DroppableAreaProps {
  id: string;
  colSpan: 1 | 2;
  children: React.ReactNode;
}

export interface ReportCardProps {
  title: string;
  value: number | string;
  percentage?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  className?: string;
}

export interface TagData {
  _id: string;
  name: string;
  group?: string;
  count: number;
  percentage: number;
}

export interface SourceData {
  _id: string;
  name: string;
  count: number;
  percentage: number;
}

export interface TicketPropertyFilter {
  propertyId: string;
  type?: string;
  values: string[];
}

export interface ReportChartFilters {
  date?: string;
  fromDate?: string;
  toDate?: string;
  source?: string;
  state?: string;
  statusIds?: string[];
  frequency?: string;
  groupPropertyId?: string;
  channelIds?: string[];
  memberIds?: string[];
  pipelineIds?: string[];
  tagIds?: string[];
  customerIds?: string[];
  companyIds?: string[];
  propertyIds?: string[];
  pageIds?: string[];
  priority?: number[];
  propertyValueFilters?: TicketPropertyFilter[];
}

export interface ReportChart {
  _id: string;
  name: string;
  chartType: string;
  visualType?: ResponsesChartType;
  colSpan?: number;
  filters?: ReportChartFilters;
}

export interface ConversationListItem {
  _id: string;
  content: string;
  customerId: string;
  userId: string;
  assignedUserId: string;
  status: string;
  messages: {
    _id: string;
    content: string;
    userId: string;
    customerId: string;
  }[];
  createdAt: string;
  readUsers: {
    _id: string;
    details: {
      avatar: string;
      fullName: string;
      position: string;
    };
  }[];
}

export interface ConversationUserMessageStat {
  user: IUser;
  messageCount: number;
}

export enum ResponsesChartType {
  Table = 'table',
  Bar = 'bar',
  Line = 'line',
  Pie = 'pie',
  Radar = 'radar',
}

export interface ResponsesChartTypeOption {
  IconComponent: Icon;
  value: ResponsesChartType;
  label: string;
}

export enum ReportHotKeyScope {
  ReportPage = 'report-page',
}

export interface FacebookPage {
  _id: string;
  name: string;
}

export interface FacebookSummary {
  posts: number;
  comments: number;
  conversations: number;
  messages: number;
  incomingMessages: number;
  botMessages: number;
  staffMessages: number;
  botConversations: number;
  botCoverage: number;
}

export interface FacebookActivityPoint {
  date: string;
  conversations: number;
  messages: number;
  comments: number;
}

export interface FacebookPostRow {
  _id: string;
  content?: string;
  permalink?: string;
  comments: number;
  replies: number;
  commenters: number;
  postedAt?: string;
  lastActivityAt?: string;
  metaCommentCount?: number;
  metaReactionCount?: number;
  metaShareCount?: number;
  metaSyncedAt?: string;
}

export interface FacebookSyncResult {
  pages: number;
  fetched: number;
  updated: number;
  missingInErxes: number;
  syncedAt: string;
  errors: { pageId: string; message: string }[];
}

export interface FacebookPostResult {
  list: FacebookPostRow[];
  totalCount: number;
  page: number;
  totalPages: number;
}

export interface FacebookBotRow {
  _id: string;
  name: string;
  pageId: string;
  count: number;
  messages: number;
  percentage: number;
}
