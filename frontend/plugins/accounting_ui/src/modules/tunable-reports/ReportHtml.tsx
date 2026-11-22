import { useMemo } from 'react';
import {
  ReportOrganization,
  sanitizeReportHtml,
} from '@/tunable-reports/reportText';

export const ReportHtml = ({
  value,
  fromDate,
  toDate,
  organization,
}: {
  value: string;
  fromDate?: string;
  toDate?: string;
  organization?: ReportOrganization;
}) => {
  const html = useMemo(
    () => sanitizeReportHtml(value, { fromDate, toDate, organization }),
    [value, fromDate, toDate, organization],
  );
  return (
    <div
      className="whitespace-pre-wrap [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-6 [&_ol]:pl-6"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
