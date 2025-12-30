import {
<<<<<<< HEAD
  Button,
  cn,
=======
>>>>>>> 9cfd10db61f566ef2c1ae623a902776969ee615a
  IconComponent,
  Sidebar
} from 'erxes-ui';
import { ReportRules } from '../types/reportsMap'
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
            {Object.keys(ReportRules).map((repKey) => (
              <Sidebar.MenuItem key={repKey} className='flex'>
                <Sidebar.MenuButton isActive={activeReport === repKey} onClick={() => setActiveReport(repKey)}>
                  {ReportRules[repKey].icon ? <IconComponent name={ReportRules[repKey].icon} /> : <IconReport />}
                  {ReportRules[repKey].title}
                </Sidebar.MenuButton>
              </Sidebar.MenuItem>
            ))}
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>
    </Sidebar>
  )
};
