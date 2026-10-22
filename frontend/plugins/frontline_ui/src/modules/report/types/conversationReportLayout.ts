import type { ReactNode } from 'react';
import type {
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  Modifier,
  SensorDescriptor,
  SensorOptions,
} from '@dnd-kit/core';
import type { ReportChart } from '@/report/types';

export interface ConversationReportCard {
  id: string;
  colSpan: 6 | 12;
}

export interface ConversationReportDropAreaProps
  extends ConversationReportCard {
  children: ReactNode;
}

export interface ConversationReportChartProps {
  card: ConversationReportCard;
  savedChart?: ReportChart;
  onColSpanChange: (id: string, colSpan: 6 | 12) => void;
  overrideColSpan?: 6 | 12;
}

export interface ConversationReportLayout {
  cards: ConversationReportCard[];
  savedChartsById: Map<string, ReportChart>;
  sensors: SensorDescriptor<SensorOptions>[];
  modifiers: Modifier[];
  handleDragStart: (event: DragStartEvent) => void;
  handleDragOver: (event: DragOverEvent) => void;
  handleDragEnd: (event: DragEndEvent) => void;
  handleColSpanChange: (id: string, colSpan: 6 | 12) => void;
  activeCard?: ConversationReportCard;
  previewColSpan: 6 | 12;
}
