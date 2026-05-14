import {
  cn,
  IconComponent,
  Sidebar,
  TextOverflowTooltip,
  useQueryState,
} from 'erxes-ui';
import { Link, useLocation } from 'react-router-dom';
import { REPORT_MODULES } from '../constants/modules';

export const ChooseReportModule = () => {
  const location = useLocation();
  const isCallReport = location.pathname.startsWith('/frontline/reports/call');
  const isTicketReport = location.pathname.startsWith(
    '/frontline/reports/ticket',
  );
  const isOverviewReport = !isCallReport && !isTicketReport;

  return (
    <>
      <ReportRouteItem
        to="/frontline/reports"
        name="Frontline Overview"
        icon="IconChartHistogram"
        isActive={isOverviewReport}
      />
      <ReportRouteItem
        to="/frontline/reports/call"
        name="Call Center"
        icon="IconPhoneCall"
        isActive={isCallReport}
      />
      {isOverviewReport &&
        REPORT_MODULES.map((module) => (
          <ReportModuleItem key={module.module} {...module} />
        ))}
    </>
  );
};

const ReportRouteItem = ({
  to,
  name,
  icon,
  isActive,
}: {
  to: string;
  name: string;
  icon: string;
  isActive: boolean;
}) => {
  return (
    <Sidebar.Group className="p-0">
      <Sidebar.MenuItem>
        <Sidebar.MenuButton asChild isActive={isActive}>
          <Link to={to}>
            <IconComponent
              name={icon}
              className={cn(
                'text-accent-foreground shrink-0 size-4',
                isActive && 'text-primary',
              )}
            />
            <TextOverflowTooltip
              className="font-sans font-semibold normal-case flex-1 min-w-0"
              value={name}
            />
          </Link>
        </Sidebar.MenuButton>
      </Sidebar.MenuItem>
    </Sidebar.Group>
  );
};

export const ReportModuleItem = ({
  name,
  icon,
  module,
}: {
  name: string;
  icon: string;
  module: string;
}) => {
  const [reportModule, setReportModule] = useQueryState<string>('reportModule');
  const isActive = reportModule === module;
  return (
    <Sidebar.Group className="p-0">
      <div className="w-full relative group/trigger hover:cursor-pointer">
        <div className="w-full flex items-center justify-between">
          <Sidebar.MenuButton
            isActive={isActive}
            onClick={() => {
              setReportModule(module);
            }}
          >
            <div className="flex items-center gap-2">
              <IconComponent
                name={icon}
                className={cn(
                  'text-accent-foreground shrink-0 size-4',
                  isActive && 'text-primary',
                )}
              />
              <TextOverflowTooltip
                className="font-sans font-semibold normal-case flex-1 min-w-0"
                value={name}
              />
            </div>
          </Sidebar.MenuButton>
        </div>
      </div>
    </Sidebar.Group>
  );
};
