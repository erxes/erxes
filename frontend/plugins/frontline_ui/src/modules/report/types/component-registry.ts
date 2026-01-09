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
  'conversation-open': lazy(
    () =>
      import(
        '@/report/components/FrontlineReportOpen'
      ).then((module) => ({ default: module.FrontlineReportOpen })),
  ),
  'conversation-resolved': lazy(
    () =>
      import(
        '@/report/components/FrontlineReportByResolved'
      ).then((module) => ({ default: module.FrontlineReportByResolved })),
  ),
  'conversation-source': lazy(
    () =>
      import(
        '@/report/components/FrontlineReportBySource'
      ).then((module) => ({ default: module.FrontlineReportBySource })),
  ),
  'conversation-tag': lazy(
    () =>
      import(
        '@/report/components/FrontlineReportByTag'
      ).then((module) => ({ default: module.FrontlineReportByTag })),
  ),
  'conversation-responses': lazy(
    () =>
      import(
        '@/report/components/FrontlineReportByResponses'
      ).then((module) => ({ default: module.FrontlineReportByResponses })),
  ),
  'conversation-list': lazy(
    () =>
      import(
        '@/report/components/FrontlineReportByList'
      ).then((module) => ({ default: module.FrontlineReportByList })),
  ),
};

export const DEFAULT_CARD_CONFIGS: Omit<ReportCardConfig, 'component'>[] = [
  { id: 'conversation-open', title: 'Conversation Open', colSpan: 6 },
  { id: 'conversation-resolved', title: 'Conversation Resolved', colSpan: 6 },
  { id: 'conversation-source', title: 'Conversation Source', colSpan: 6 },
  { id: 'conversation-tag', title: 'Conversation Tag', colSpan: 6 },
  { id: 'conversation-responses', title: 'Conversation Responses', colSpan: 6 },
  { id: 'conversation-list', title: 'Conversation List', colSpan: 6 },
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

