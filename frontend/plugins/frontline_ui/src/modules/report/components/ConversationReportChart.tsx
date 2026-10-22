import { Skeleton } from 'erxes-ui';
import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DEFAULT_CARD_CONFIGS,
  type ReportComponentProps,
  reportComponents,
} from '../types/component-registry';
import type { ConversationReportChartProps } from '@/report/types/conversationReportLayout';

export const ConversationReportChart = ({
  card,
  savedChart,
  onColSpanChange,
  overrideColSpan,
}: ConversationReportChartProps) => {
  const { t } = useTranslation('frontline');
  const { id, colSpan } = card;
  const config = DEFAULT_CARD_CONFIGS.find((item) => item.id === id);
  const Component =
    reportComponents[savedChart ? savedChart.chartType ?? '' : id];
  if (!Component || (!savedChart && !config)) return null;
  const commonProps: ReportComponentProps = {
    title: savedChart ? savedChart.name ?? '' : t(config?.title ?? ''),
    cardId: id,
    savedChart,
    colSpan: overrideColSpan ?? colSpan,
    onColSpanChange: (span: 6 | 12) => onColSpanChange(id, span),
  };
  return (
    <Suspense
      fallback={
        <div className={colSpan === 6 ? 'col-span-6' : 'col-span-12'}>
          <Skeleton className="h-64 w-full" />
        </div>
      }
    >
      <Component {...commonProps} />
    </Suspense>
  );
};
