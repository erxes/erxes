import { format } from 'date-fns';
import { Separator, useQueryState } from 'erxes-ui';
import { useAtom } from 'jotai';
import type { RefObject } from 'react';
import { currentOrganizationState } from 'ui-modules';
import { ReportRules } from '../types/reportsMap';
import { ReportExcelExportButton } from './ReportExcelExportButton';

interface IReportHeaderProps {
  reportContainerRef: RefObject<HTMLDivElement>;
}

const parseQueryDate = (value?: string): string => {
  if (!value) return '';

  return format(new Date(value), 'yyyy-MM-dd');
};

export const ReportHeader = ({ reportContainerRef }: IReportHeaderProps) => {
  const [currentOrganization] = useAtom(currentOrganizationState);
  const [report] = useQueryState('report');
  const [fromDate] = useQueryState('fromDate');
  const [toDate] = useQueryState('toDate');

  const title = ReportRules[(report as string) || '']?.title;
  const from = parseQueryDate(fromDate as string);
  const to = parseQueryDate(toDate as string);

  return (
    <>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-[1em]">
        <h1 className="text-[2em] leading-tight font-bold text-center">
          {title}
        </h1>
        <div>
          <ReportExcelExportButton reportContainerRef={reportContainerRef} />
        </div>
      </div>
      <div className="flex justify-between pb-[2em]">
        <div className="flex flex-col gap-1">
          <p className="font-bold">{currentOrganization?.name ?? 'OrgName'}</p>
          <Separator className="print:bg-foreground bg-border" />
          <p>(Аж ахуй нэгж албан байгууллагын нэр)</p>
        </div>
        <div className="flex flex-col gap-1 text-right">
          <p>{[from, to].filter((d) => d).join(' - ')}</p>
          <p>(төгрөгөөр)</p>
        </div>
      </div>
    </>
  );
};
