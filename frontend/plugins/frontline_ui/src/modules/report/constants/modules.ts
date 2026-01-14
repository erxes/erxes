import {
  ReportWidgetTypeOption,
  ResponsesChartType,
  ResponsesChartTypeOption,
} from '../types';
import {
  IconChartBar,
  IconChartRadar,
  IconChartPie,
  IconChartLine,
  IconTable,
} from '@tabler/icons-react';
import { ReportWidgetType } from '../types/report-widget';

export const REPORT_MODULES = [
  {
    name: 'Conversations',
    icon: 'IconMessage',
    module: 'conversation',
  },
  {
    name: 'Tickets',
    icon: 'IconTicket',
    module: 'ticket',
  },
  {
    name: 'Channels',
    icon: 'IconDeviceLaptop',
    module: 'channel',
  },
];

export const RESPONSES_CHART_TYPE_OPTIONS: ResponsesChartTypeOption[] = [
  {
    IconComponent: IconTable,
    value: ResponsesChartType.Table,
    label: 'Table',
  },
  {
    IconComponent: IconChartBar,
    value: ResponsesChartType.Bar,
    label: 'Bar',
  },
  {
    IconComponent: IconChartLine,
    value: ResponsesChartType.Line,
    label: 'Line',
  },
  {
    IconComponent: IconChartPie,
    value: ResponsesChartType.Pie,
    label: 'Pie',
  },
  {
    IconComponent: IconChartRadar,
    value: ResponsesChartType.Radar,
    label: 'Radar',
  },
];

export const REPORT_WIDGET_OPTIONS: ReportWidgetTypeOption[] = [
  {
    value: ReportWidgetType.ConversationOpen,
    label: 'Conversation Open',
  },
  {
    value: ReportWidgetType.ConversationResolved,
    label: 'Conversation Resolved',
  },
  {
    value: ReportWidgetType.ConversationTags,
    label: 'Conversation Tags',
  },
  {
    value: ReportWidgetType.ConversationSources,
    label: 'Conversation Sources',
  },
  {
    value: ReportWidgetType.ConversationResponses,
    label: 'Conversation Responses',
  },
];
