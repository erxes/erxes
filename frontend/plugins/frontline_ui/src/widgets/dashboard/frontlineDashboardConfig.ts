import { ReportChart, ResponsesChartType } from '@/report/types';
import { z } from 'zod';

// `all-time` stands for "no date filter": a select item can't hold ''.
export const DASHBOARD_ALL_TIME = 'all-time';

export const DASHBOARD_DATE_OPTIONS = [
  DASHBOARD_ALL_TIME,
  'today',
  'yesterday',
  'this-week',
  'last-week',
  'this-month',
  'last-month',
  'this-year',
  'last-year',
] as const;

// Field names match a saved report chart's `filters`.
export const frontlineDashboardConfigSchema = z.object({
  visualType: z.nativeEnum(ResponsesChartType).optional(),
  filters: z.object({
    date: z.enum(DASHBOARD_DATE_OPTIONS),
    source: z.string().optional(),
    channelIds: z.array(z.string()).optional(),
    pipelineIds: z.array(z.string()).optional(),
    pageIds: z.array(z.string()).optional(),
  }),
});

export type TFrontlineDashboardConfig = z.infer<
  typeof frontlineDashboardConfigSchema
>;

export const DEFAULT_FRONTLINE_DASHBOARD_CONFIG: TFrontlineDashboardConfig = {
  filters: { date: 'this-month' },
};

const EMPTY_SAVED_FILTERS: NonNullable<ReportChart['filters']> = {
  statusChangedDate: null,
  updatedAtDate: null,
  description: null,
  statusChangedByIds: null,
  updatedByIds: null,
  date: null,
  fromDate: null,
  toDate: null,
  source: null,
  state: null,
  statusIds: null,
  frequency: null,
  groupPropertyId: null,
  channelIds: null,
  memberIds: null,
  pipelineIds: null,
  tagIds: null,
  customerIds: null,
  companyIds: null,
  pageIds: null,
  searchValue: null,
  propertyIds: null,
  priority: null,
  propertyValueFilters: null,
};

const orNull = <T>(values?: T[]) => (values?.length ? values : null);

/**
 * The tile's config as the saved chart the report card restores its filters
 * from. The id changes with the config, so an edited tile restores again.
 */
export const toDashboardReportChart = (
  module: string,
  config: TFrontlineDashboardConfig,
): ReportChart => {
  const { filters, visualType } = config;

  return {
    _id: `dashboard:${module}:${JSON.stringify(config)}`,
    name: null,
    chartType: module,
    visualType: visualType ?? null,
    colSpan: null,
    filters: {
      ...EMPTY_SAVED_FILTERS,
      date: filters.date === DASHBOARD_ALL_TIME ? null : filters.date,
      source: filters.source || null,
      channelIds: orNull(filters.channelIds),
      pipelineIds: orNull(filters.pipelineIds),
      pageIds: orNull(filters.pageIds),
    },
  };
};
