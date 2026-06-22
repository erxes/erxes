import React, { useState } from 'react';
import { format } from 'date-fns';
import { useParams } from 'react-router-dom';
import { DashboardSummary } from './components/DashboardSummary';
import { DateRangePicker } from './components/DateRangePicker';
import { KanbanBoard } from './components/KanbanBoard';
import { ForecastWidget } from './components/ForecastWidget';
import { ExportButton } from './components/ExportButton';
import { WidgetList } from './components/Saved Widgets/WidgetList';
import { DealReportChart } from './components/DealReportChart';
import { useDealChangedSubscription } from './hooks/useDealChangedSubscription';

export const SalesReportsDashboard: React.FC = () => {
  const { pipelineId } = useParams<{ pipelineId: string }>();
  const today = new Date();
  const defaultFrom = new Date(today.getFullYear(), today.getMonth(), 1);
  const [fromDate, setFromDate] = useState(format(defaultFrom, 'yyyy-MM-dd'));
  const [toDate, setToDate] = useState(format(today, 'yyyy-MM-dd'));
  const [loadedWidget, setLoadedWidget] = useState<any | null>(null);

  useDealChangedSubscription(pipelineId);

  const handleDateChange = (from: string, to: string) => {
    setFromDate(from);
    setToDate(to);
  };

  const handleLoadWidget = (widget: any) => {
    setLoadedWidget(widget);
    console.log('Loaded widget:', widget);
  };

  return (
    <div className="h-[calc(100vh-4rem)] overflow-y-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Sales Pipeline Report 3.0</h1>
        <div className="flex items-center gap-3">
          <DateRangePicker fromDate={fromDate} toDate={toDate} onChange={handleDateChange} />
          <ExportButton chartType="DealsTotalCount" filters={{ fromDate, toDate }} />
        </div>
      </div>

      <DashboardSummary filters={{ fromDate, toDate }} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <KanbanBoard filters={{ fromDate, toDate }} pipelineId={pipelineId || ''} />
        </div>
        <div>
          <ForecastWidget filters={{ fromDate, toDate }} />
        </div>
      </div>

      <div className="mt-8">
        <WidgetList onLoad={handleLoadWidget} />
        {loadedWidget && (
          <div className="mt-4">
            <DealReportChart
              chartType={loadedWidget.chartType}
              filters={loadedWidget.filters}
              title={loadedWidget.name}
            />
          </div>
        )}
      </div>
    </div>
  );
};