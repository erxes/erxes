import { Breadcrumb, Button, PageContainer } from 'erxes-ui';
import { Link } from 'react-router-dom';
import { PageHeader } from 'ui-modules';
import { IconChartHistogram } from '@tabler/icons-react';
import { ReportsView } from '@/report/components/ReportsView';
import { ReportsBreadcrumbs } from '@/report/components/report-navigations/ReportsBreadcrumbs';

export default function ReportIndexPage() {
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
              <ReportsBreadcrumbs />
            </Breadcrumb.List>
          </Breadcrumb>
        </PageHeader.Start>
      </PageHeader>
      <ReportsView />
    </PageContainer>
  );
}
