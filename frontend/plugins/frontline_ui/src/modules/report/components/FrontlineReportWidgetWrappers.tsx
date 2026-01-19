import { FrontlineReportWidget } from './FrontlineReportWidget';
import type { ReportComponentProps } from '../types/component-registry';
import type { ReportType } from '../reportConfig';

function createWidgetWrapper(reportType: ReportType) {
  return function WidgetWrapper(props: ReportComponentProps) {
    return <FrontlineReportWidget reportType={reportType} {...props} />;
  };
}

export const FrontlineReportOpenWidget = createWidgetWrapper('openDates');
export const FrontlineReportResolvedWidget =
  createWidgetWrapper('resolvedDates');
export const FrontlineReportSourceWidget = createWidgetWrapper('sources');
export const FrontlineReportTagWidget = createWidgetWrapper('tags');
export const FrontlineReportResponsesWidget = createWidgetWrapper('responses');
export const FrontlineReportListWidget = createWidgetWrapper('list');
