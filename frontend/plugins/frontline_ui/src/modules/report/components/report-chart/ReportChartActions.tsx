import {
  ReportChart,
  ReportChartFilters,
  ResponsesChartType,
} from '@/report/types';
import { RemoveReportChartButton } from './RemoveReportChartButton';
import { SaveReportChartButton } from './SaveReportChartButton';

interface ReportChartActionsProps {
  chartType: string;
  visualType?: ResponsesChartType;
  colSpan: 6 | 12;
  filters: ReportChartFilters;
  savedChart?: ReportChart;
}

export const ReportChartActions = ({
  chartType,
  visualType,
  colSpan,
  filters,
  savedChart,
}: ReportChartActionsProps) => (
  <>
    <SaveReportChartButton
      chartType={chartType}
      visualType={visualType}
      colSpan={colSpan}
      filters={filters}
    />
    {savedChart && (
      <RemoveReportChartButton
        chartId={savedChart._id}
        chartName={savedChart.name}
      />
    )}
  </>
);
