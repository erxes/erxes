import {
  Button,
  cn
} from 'erxes-ui';
import { AllReportsMap } from '../types/reportsMap'
import { activeReportState } from '../states/renderingReportsStates';
import { useAtom } from 'jotai';
import { IconReport } from '@tabler/icons-react';

export const ReportsList = () => {
  const [activeReport, setActiveReport] = useAtom(activeReportState);

  return (
    <ul>
      {AllReportsMap.map((report) => (
        <li>
          <IconReport />
          <Button variant="ghost" className={cn(activeReport === report.key && 'text-primary')} onClick={() => setActiveReport(report.key)}>
            {report.title}
          </Button>
        </li>
      ))}
    </ul>
  );
};
