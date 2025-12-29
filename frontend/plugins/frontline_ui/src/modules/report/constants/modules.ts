import { ResponsesChartType, ResponsesChartTypeOption } from '../types';
import {
  IconChartBar,
  IconChartRadar,
  IconChartPie,
  IconChartDonut,
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
    IconComponent: IconChartDonut,
    value: ResponsesChartType.Donut,
    label: 'Donut',
  },
  {
    IconComponent: IconChartRadar,
    value: ResponsesChartType.Radar,
    label: 'Radar',
  },
];
