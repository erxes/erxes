import { ComponentType, LazyExoticComponent, lazy } from 'react';

export interface ReportComponentProps {
  title: string;
  colSpan?: 6 | 12;
  onColSpanChange?: (span: 6 | 12) => void;
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
  'ticket-date': lazy(() =>
    import('@/report/components/ticket-charts/TicketOpenDate').then(
      (module) => ({
        default: module.TicketOpenDate,
      }),
    ),
  ),
  'ticket-source': lazy(() =>
    import('@/report/components/ticket-charts/TicketSource').then((module) => ({
      default: module.TicketSource,
    })),
  ),
  'ticket-tags': lazy(() =>
    import('@/report/components/ticket-charts/TicketTags').then((module) => ({
      default: module.TicketTags,
    })),
  ),
  'ticket-list': lazy(() =>
    import('@/report/components/ticket-charts/TicketList').then((module) => ({
      default: module.TicketList,
    })),
  ),
  'ticket-custom-properties': lazy(() =>
    import('@/report/components/ticket-charts/TicketCustomProperties').then(
      (module) => ({
        default: module.TicketCustomProperties,
      }),
    ),
  ),
  'ticket-status-summary': lazy(() =>
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
  { id: 'ticket-status-summary', title: 'ticket-status-summary-title', colSpan: 6 },
  { id: 'ticket-date', title: 'ticket-date-title', colSpan: 6 },
  { id: 'ticket-source', title: 'ticket-source-title', colSpan: 6 },
  { id: 'ticket-tags', title: 'ticket-tags-title', colSpan: 6 },
  {
    id: 'ticket-custom-properties',
    title: 'ticket-custom-properties-title',
    colSpan: 6,
  },
  { id: 'ticket-list', title: 'ticket-list-title', colSpan: 12 },
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
