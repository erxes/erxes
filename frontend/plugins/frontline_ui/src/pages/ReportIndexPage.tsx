import { Breadcrumb, Button, PageContainer, Separator } from 'erxes-ui';
import { Link, useLocation } from 'react-router-dom';
import { PageHeader } from 'ui-modules';
import { IconChartHistogram } from '@tabler/icons-react';
import { ReportsView } from '@/report/components/ReportsView';
import { ReportsBreadcrumbs } from '@/report/components/report-navigations/ReportsBreadcrumbs';

export default function ReportIndexPage() {
  const location = useLocation();
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
              {location.pathname.includes('/call') && (
                <>
                  <Separator.Inline />
                  <Breadcrumb.Item>
                    <span className="font-medium">Call</span>
                  </Breadcrumb.Item>
                </>
              )}

              <ReportsBreadcrumbs />
            </Breadcrumb.List>
          </Breadcrumb>
        </PageHeader.Start>
        <PageHeader.End>
          <></>
        </PageHeader.End>
      </PageHeader>
      <ReportsView />
    </PageContainer>
  );
}
