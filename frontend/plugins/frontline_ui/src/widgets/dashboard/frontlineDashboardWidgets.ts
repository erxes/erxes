import {
  Icon,
  IconBrandFacebook,
  IconChartBar,
  IconChartDots,
  IconChartPie,
  IconListDetails,
  IconMessageCheck,
  IconMessageCircle,
  IconMessageReply,
  IconRobot,
  IconTable,
  IconTags,
  IconTicket,
} from '@tabler/icons-react';
import { ResponsesChartType } from '@/report/types';
import { TDashboardWidgetPreview } from 'erxes-ui';

export type TFrontlineDashboardGroup = 'conversation' | 'ticket' | 'facebook';

type TGridSize = { w: number; h: number };

export type TFrontlineDashboardWidget = {
  // Also the report registry key and the saved chart's `chartType`.
  name: string;
  group: TFrontlineDashboardGroup;
  icon: Icon;
  // Schematic the dashboard catalog draws for the widget.
  preview: TDashboardWidgetPreview;
  defaultSize: TGridSize;
  minSize: TGridSize;
  // Chart types the chart's own switch offers; none for fixed tables.
  visualTypes?: ResponsesChartType[];
};

const ALL_VISUAL_TYPES = Object.values(ResponsesChartType);
const AXIS_VISUAL_TYPES = [ResponsesChartType.Bar, ResponsesChartType.Line];

// Charts are 16:9 plus pagination, so a half-width tile needs ~10 rows;
// tables need 8 columns before every column fits.
const CHART_SIZE = { defaultSize: { w: 6, h: 10 }, minSize: { w: 4, h: 7 } };
const WIDE_CHART_SIZE = {
  defaultSize: { w: 12, h: 11 },
  minSize: { w: 6, h: 7 },
};
const TABLE_SIZE = { defaultSize: { w: 12, h: 11 }, minSize: { w: 8, h: 8 } };

export const FRONTLINE_DASHBOARD_WIDGETS: TFrontlineDashboardWidget[] = [
  {
    name: 'conversation-open',
    preview: 'bar',
    group: 'conversation',
    icon: IconMessageCircle,
    visualTypes: ALL_VISUAL_TYPES,
    ...CHART_SIZE,
  },
  {
    name: 'conversation-resolved',
    preview: 'bar',
    group: 'conversation',
    icon: IconMessageCheck,
    visualTypes: ALL_VISUAL_TYPES,
    ...CHART_SIZE,
  },
  {
    name: 'conversation-source',
    preview: 'pie',
    group: 'conversation',
    icon: IconChartPie,
    visualTypes: ALL_VISUAL_TYPES,
    ...CHART_SIZE,
  },
  {
    name: 'conversation-tag',
    preview: 'pie',
    group: 'conversation',
    icon: IconTags,
    visualTypes: ALL_VISUAL_TYPES,
    ...CHART_SIZE,
  },
  {
    name: 'conversation-responses',
    preview: 'bar',
    group: 'conversation',
    icon: IconMessageReply,
    visualTypes: ALL_VISUAL_TYPES,
    ...CHART_SIZE,
  },
  {
    name: 'conversation-list',
    preview: 'table',
    group: 'conversation',
    icon: IconListDetails,
    ...TABLE_SIZE,
  },
  {
    name: 'ticket-status-summary',
    preview: 'bar',
    group: 'ticket',
    icon: IconTicket,
    visualTypes: ALL_VISUAL_TYPES,
    ...CHART_SIZE,
  },
  {
    name: 'ticket-date',
    preview: 'bar',
    group: 'ticket',
    icon: IconChartBar,
    visualTypes: ALL_VISUAL_TYPES,
    ...CHART_SIZE,
  },
  {
    name: 'ticket-source',
    preview: 'pie',
    group: 'ticket',
    icon: IconChartPie,
    visualTypes: ALL_VISUAL_TYPES,
    ...CHART_SIZE,
  },
  {
    name: 'ticket-tags',
    preview: 'pie',
    group: 'ticket',
    icon: IconTags,
    visualTypes: ALL_VISUAL_TYPES,
    ...CHART_SIZE,
  },
  {
    name: 'ticket-custom-properties',
    preview: 'table',
    group: 'ticket',
    icon: IconChartDots,
    ...CHART_SIZE,
  },
  {
    name: 'ticket-list',
    preview: 'table',
    group: 'ticket',
    icon: IconTable,
    ...TABLE_SIZE,
  },
  {
    name: 'facebook-activity',
    preview: 'line',
    group: 'facebook',
    icon: IconBrandFacebook,
    visualTypes: AXIS_VISUAL_TYPES,
    ...WIDE_CHART_SIZE,
  },
  {
    name: 'facebook-posts',
    preview: 'table',
    group: 'facebook',
    icon: IconListDetails,
    ...TABLE_SIZE,
  },
  {
    name: 'facebook-bots',
    preview: 'bar',
    group: 'facebook',
    icon: IconRobot,
    visualTypes: ALL_VISUAL_TYPES,
    ...CHART_SIZE,
  },
];

export const getFrontlineDashboardWidget = (name: string) =>
  FRONTLINE_DASHBOARD_WIDGETS.find((widget) => widget.name === name);
