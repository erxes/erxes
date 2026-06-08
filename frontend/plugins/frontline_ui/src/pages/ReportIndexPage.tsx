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
import { ReportsBreadcrumbs } from '@/report/components/report-navigations/ReportsBreadcrumbs';
import { CallReportsView } from '@/report/components/CallReportsView';
import { TicketReportsView } from '@/report/components/TicketReportsView';

export default function ReportIndexPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const isCallReport = location.pathname.includes('/call');
  const isTicketReport = location.pathname.includes('/ticket');
  const isOverviewReport = !isCallReport && !isTicketReport;

  const activeSection = isCallReport ? 'call' : 'overview';

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

              {/* Submenu Breadcrumbs */}
              {location.pathname.includes('/inbox') && (
                <>
                  <Separator.Inline />
                  <Breadcrumb.Item>
                    <span className="font-medium">Inbox</span>
                  </Breadcrumb.Item>
                </>
              )}
              {location.pathname.includes('/ticket') && (
                <>
                  <Separator.Inline />
                  <Breadcrumb.Item>
                    <span className="font-medium">Ticket</span>
                  </Breadcrumb.Item>
                </>
              )}

              <ReportsBreadcrumbs />
            </Breadcrumb.List>
          </Breadcrumb>

          <ToggleGroup
            type="single"
            variant="outline"
            size="sm"
            value={activeSection}
            onValueChange={(v) => {
              if (!v) return;
              navigate(
                v === 'call' ? '/frontline/reports/call' : '/frontline/reports',
              );
            }}
          >
            <ToggleGroup.Item value="overview">
              Frontline Overview
            </ToggleGroup.Item>
            <ToggleGroup.Item value="call">Call Center</ToggleGroup.Item>
          </ToggleGroup>
        </PageHeader.Start>
      </PageHeader>
      {isTicketReport ? (
        <TicketReportsView />
      ) : isCallReport ? (
        <CallReportsView />
      ) : (
        <ReportsView />
      )}
    </PageContainer>
  );
}
