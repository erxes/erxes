import {
  Breadcrumb,
  Button,
  PageContainer,
  Separator,
  ToggleGroup,
} from 'erxes-ui';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { PageHeader, createFavoriteBreadcrumb } from 'ui-modules';
import { IconChartHistogram } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { ReportsView } from '@/report/components/ReportsView';
import { CallReportsView } from '@/report/components/CallReportsView';
import { TicketReportsList } from '@/report/components/TicketReportsList';
import { FacebookReportsList } from '@/report/components/FacebookReportsList';
import {
  OVERVIEW_KPI_DATE_FILTER_ID,
  ReportKpiDateFilter,
  TICKET_PRIORITY_DATE_FILTER_ID,
} from '@/report/components/filter-popover/ReportKpiDateFilter';

const ROUTES = {
  overview: '/frontline/reports',
  call: '/frontline/reports/call',
  ticket: '/frontline/reports/ticket',
  facebook: '/frontline/reports/facebook',
} as const;

type Section = keyof typeof ROUTES;

export default function ReportIndexPage() {
  const { t } = useTranslation('frontline');
  const location = useLocation();
  const navigate = useNavigate();

  let activeSection: Section = 'overview';

  if (location.pathname.includes('/call')) {
    activeSection = 'call';
  } else if (location.pathname.includes('/ticket')) {
    activeSection = 'ticket';
  } else if (location.pathname.includes('/facebook')) {
    activeSection = 'facebook';
  }

  let activeSectionLabel: string | undefined;

  if (activeSection === 'call') {
    activeSectionLabel = t('call-center');
  } else if (activeSection === 'ticket') {
    activeSectionLabel = t('ticket');
  } else if (activeSection === 'facebook') {
    activeSectionLabel = t('facebook-reports');
  }

  let reportContent = <ReportsView />;

  if (activeSection === 'ticket') {
    reportContent = <TicketReportsList />;
  } else if (activeSection === 'call') {
    reportContent = <CallReportsView />;
  } else if (activeSection === 'facebook') {
    reportContent = <FacebookReportsList />;
  }

  const favoriteBreadcrumb = createFavoriteBreadcrumb(
    'Frontline',
    t('reports'),
    activeSectionLabel,
  );
  const kpiDateFilterId =
    activeSection === 'ticket'
      ? TICKET_PRIORITY_DATE_FILTER_ID
      : OVERVIEW_KPI_DATE_FILTER_ID;

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
                    {t('reports')}
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
              {t('frontline-overview')}
            </ToggleGroup.Item>
            <ToggleGroup.Item value="ticket">{t('ticket')}</ToggleGroup.Item>
            <ToggleGroup.Item value="facebook">
              {t('facebook-reports')}
            </ToggleGroup.Item>
            <ToggleGroup.Item value="call">{t('call-center')}</ToggleGroup.Item>
          </ToggleGroup>
          <Separator.Inline />
          <PageHeader.FavoriteToggleButton
            breadcrumb={favoriteBreadcrumb}
            icon="IconChartHistogram"
          />
        </PageHeader.Start>
        {activeSection !== 'call' && (
          <PageHeader.End>
            <ReportKpiDateFilter filterId={kpiDateFilterId} />
          </PageHeader.End>
        )}
      </PageHeader>

      {reportContent}
    </PageContainer>
  );
}
