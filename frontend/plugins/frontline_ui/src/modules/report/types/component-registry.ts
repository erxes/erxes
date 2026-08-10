import { ComponentType, LazyExoticComponent, lazy } from 'react';
import { ReportChart } from '@/report/types';

export const TICKET_CHART_TYPES = {
  statusSummary: 'ticket-status-summary',
  date: 'ticket-date',
  source: 'ticket-source',
  tags: 'ticket-tags',
  customProperties: 'ticket-custom-properties',
  list: 'ticket-list',
} as const;

export interface ReportComponentProps {
  title: string;
  colSpan?: 6 | 12;
  onColSpanChange?: (span: 6 | 12) => void;
  cardId?: string;
  savedChart?: ReportChart;
}

export interface ReportCardConfig {
  id: string;
  title: string;
  colSpan: 6 | 12;
  component: LazyExoticComponent<ComponentType<ReportComponentProps>>;
}

export type ReportComponentRegistry = Map<string, ReportCardConfig>;

export const reportComponents: Record<
  string,
  LazyExoticComponent<ComponentType<ReportComponentProps>>
> = {
  'conversation-open': lazy(() =>
    import('@/report/components/conversation-charts/ConversationOpen').then(
      (module) => ({
        default: module.ConversationOpen,
      }),
    ),
  ),
  'conversation-resolved': lazy(() =>
    import('@/report/components/conversation-charts/ConversationResolved').then(
      (module) => ({
        default: module.ConversationResolved,
      }),
    ),
  ),
  'conversation-source': lazy(() =>
    import('@/report/components/conversation-charts/ConversationSource').then(
      (module) => ({
        default: module.ConversationSource,
      }),
    ),
  ),
  'conversation-tag': lazy(() =>
    import('@/report/components/conversation-charts/ConversationTag').then(
      (module) => ({
        default: module.ConversationTag,
      }),
    ),
  ),
  'conversation-responses': lazy(() =>
    import('@/report/components/conversation-charts/ConversationResponse').then(
      (module) => ({
        default: module.ConversationResponse,
      }),
    ),
  ),
  'conversation-list': lazy(() =>
    import('@/report/components/conversation-charts/ConversationList').then(
      (module) => ({
        default: module.ConversationList,
      }),
    ),
  ),
};

export const DEFAULT_CARD_CONFIGS: Omit<ReportCardConfig, 'component'>[] = [
  { id: 'conversation-open', title: 'conversation-open-title', colSpan: 6 },
  { id: 'conversation-resolved', title: 'conversation-resolved-title', colSpan: 6 },
  { id: 'conversation-source', title: 'conversation-source-title', colSpan: 6 },
  { id: 'conversation-tag', title: 'conversation-tag-title', colSpan: 6 },
  { id: 'conversation-responses', title: 'conversation-responses-title', colSpan: 6 },
  { id: 'conversation-list', title: 'conversation-list-title', colSpan: 6 },
];

export const ticketReportComponents: Record<
  string,
  LazyExoticComponent<ComponentType<ReportComponentProps>>
> = {
  [TICKET_CHART_TYPES.date]: lazy(() =>
    import('@/report/components/ticket-charts/TicketOpenDate').then(
      (module) => ({
        default: module.TicketOpenDate,
      }),
    ),
  ),
  [TICKET_CHART_TYPES.source]: lazy(() =>
    import('@/report/components/ticket-charts/TicketSource').then((module) => ({
      default: module.TicketSource,
    })),
  ),
  [TICKET_CHART_TYPES.tags]: lazy(() =>
    import('@/report/components/ticket-charts/TicketTags').then((module) => ({
      default: module.TicketTags,
    })),
  ),
  [TICKET_CHART_TYPES.list]: lazy(() =>
    import('@/report/components/ticket-charts/TicketList').then((module) => ({
      default: module.TicketList,
    })),
  ),
  [TICKET_CHART_TYPES.customProperties]: lazy(() =>
    import('@/report/components/ticket-charts/TicketCustomProperties').then(
      (module) => ({
        default: module.TicketCustomProperties,
      }),
    ),
  ),
  [TICKET_CHART_TYPES.statusSummary]: lazy(() =>
    import('@/report/components/ticket-charts/TicketStatusSummary').then(
      (module) => ({
        default: module.TicketStatusSummary,
      }),
    ),
  ),
};

export const TICKET_DEFAULT_CARD_CONFIGS: Omit<
  ReportCardConfig,
  'component'
>[] = [
  { id: TICKET_CHART_TYPES.statusSummary, title: 'ticket-status-summary-title', colSpan: 6 },
  { id: TICKET_CHART_TYPES.date, title: 'ticket-date-title', colSpan: 6 },
  { id: TICKET_CHART_TYPES.source, title: 'ticket-source-title', colSpan: 6 },
  { id: TICKET_CHART_TYPES.tags, title: 'ticket-tags-title', colSpan: 6 },
  {
    id: TICKET_CHART_TYPES.customProperties,
    title: 'ticket-custom-properties-title',
    colSpan: 6,
  },
  { id: TICKET_CHART_TYPES.list, title: 'ticket-list-title', colSpan: 12 },
];

export function getReportComponent(
  id: string,
): LazyExoticComponent<ComponentType<ReportComponentProps>> | undefined {
  return reportComponents[id];
}

export function registerReportComponent(
  id: string,
  component: LazyExoticComponent<ComponentType<ReportComponentProps>>,
): void {
  reportComponents[id] = component;
}
