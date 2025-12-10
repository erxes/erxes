import {
  Button,
  cn,
  IconComponent,
  Sidebar
} from 'erxes-ui';
import { AllReportsMap } from '../types/reportsMap'
import { activeReportState } from '../states/renderingReportsStates';
import { useAtom } from 'jotai';
import { IconReport } from '@tabler/icons-react';

export const ReportsList = () => {
  const [activeReport, setActiveReport] = useAtom(activeReportState);

  return (
    <Sidebar collapsible="none" className="border-r flex-none">
      <Sidebar.Group>
        <Sidebar.GroupContent>
          <Sidebar.Menu>
            {AllReportsMap.map((report) => (
              <Sidebar.MenuItem key={report.key} className='flex'>
                <Sidebar.MenuButton isActive={activeReport === report.key} onClick={() => setActiveReport(report.key)}>
                  {report.icon ? <IconComponent name={report.icon} /> : <IconReport />}
                  {report.title}
                </Sidebar.MenuButton>
              </Sidebar.MenuItem>
            ))}
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>
    </Sidebar>
  )
};
