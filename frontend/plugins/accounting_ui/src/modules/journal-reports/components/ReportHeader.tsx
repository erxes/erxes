import { format } from 'date-fns';
import { Separator, useQueryState } from "erxes-ui";
import { useAtom } from "jotai";
import { currentOrganizationState } from "ui-modules";
import { AllReportsMap } from '../types/reportsMap';

const parseQueryDate = (value?: string): string => {
  if (!value) return '';

  return format(new Date(value), 'yyyy-MM-dd')
};

export const ReportHeader = () => {
  const [currentOrganization] = useAtom(currentOrganizationState);
  const [report] = useQueryState('report');
  const [fromDate] = useQueryState('fromDate');
  const [toDate] = useQueryState('toDate');

  const title = AllReportsMap.find(r => r.key === report)?.title;
  const from = parseQueryDate(fromDate as string);
  const to = parseQueryDate(toDate as string);

  return (
    <>
      <h1 className="text-[2em] leading-tight font-bold text-center py-[1em]">
        {title}
      </h1>
      <div className="flex justify-between pb-[2em]">
        <div className="flex flex-col gap-1">
          <p className="font-bold">{currentOrganization?.name ?? 'OrgName'}</p>
          <Separator className="print:bg-foreground bg-border" />
          <p>(Аж ахуй нэгж албан байгууллагын нэр)</p>
        </div>
        <div className="flex flex-col gap-1 text-right">
          <p>{[from, to].filter(d => d).join(' - ')}</p>
          <p>(төгрөгөөр)</p>
        </div>
      </div>
    </>
  )
}