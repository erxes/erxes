import {
  Breadcrumb,
  Button,
  PageContainer,
  Separator,
  ToggleGroup,
} from 'erxes-ui';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { PageHeader } from 'ui-modules';
import { IconChartHistogram } from '@tabler/icons-react';
import { ReportsView } from '@/report/components/ReportsView';
import { CallReportsView } from '@/report/components/CallReportsView';
import { TicketReportsList } from '@/report/components/TicketReportsList';

const ROUTES = {
  overview: '/frontline/reports',
  call: '/frontline/reports/call',
  ticket: '/frontline/reports/ticket',
} as const;

type Section = keyof typeof ROUTES;

export default function ReportIndexPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const activeSection: Section = location.pathname.includes('/call')
    ? 'call'
    : location.pathname.includes('/ticket')
      ? 'ticket'
      : 'overview';

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <Breadcrumb>
            <Breadcrumb.List className="gap-1">
              <Breadcrumb.Item>
                <Button variant="ghost" asChild>
                  <Link to="/frontline/reports">
                    <IconChartHistogram />
                    Reports
                  </Link>
                </Button>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>
          <Separator.Inline />
          <ToggleGroup
            type="single"
            value={activeSection}
            onValueChange={(v) => {
              if (!v) return;
              navigate(ROUTES[v as Section]);
            }}
          >
            <ToggleGroup.Item value="overview">
              Frontline Overview
            </ToggleGroup.Item>
            <ToggleGroup.Item value="ticket">Ticket</ToggleGroup.Item>
            <ToggleGroup.Item value="call">Call Center</ToggleGroup.Item>
          </ToggleGroup>
          <Separator.Inline />
          <PageHeader.FavoriteToggleButton />
        </PageHeader.Start>
      </PageHeader>

      {activeSection === 'ticket' ? (
        <TicketReportsList />
      ) : activeSection === 'call' ? (
        <CallReportsView />
      ) : (
        <ReportsView />
      )}
    </PageContainer>
  );
}
