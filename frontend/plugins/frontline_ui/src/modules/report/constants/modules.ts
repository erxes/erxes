import {
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
    label: 'table',
  },
  {
    IconComponent: IconChartBar,
    value: ResponsesChartType.Bar,
    label: 'bar',
  },
  {
    IconComponent: IconChartLine,
    value: ResponsesChartType.Line,
    label: 'line',
  },
  {
    IconComponent: IconChartPie,
    value: ResponsesChartType.Pie,
    label: 'pie',
  },
  {
    IconComponent: IconChartRadar,
    value: ResponsesChartType.Radar,
    label: 'radar',
  },
];

