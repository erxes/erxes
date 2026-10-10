import {
  Breadcrumb,
  Button,
  PageContainer,
  Separator,
  ToggleGroup,
} from 'erxes-ui';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  OVERVIEW_KPI_DATE_FILTER_ID,
  ReportKpiDateFilter,
  TICKET_PRIORITY_DATE_FILTER_ID,
} from '@/report/components/filter-popover/ReportKpiDateFilter';
import { PageHeader, createFavoriteBreadcrumb } from 'ui-modules';
import {
  REPORT_SECTION_PATHS,
  getReportSection,
  getReportSections,
} from '@/report/constants/reportSections';

import { CallReportsView } from '@/report/components/CallReportsView';
import { FacebookReportsList } from '@/report/components/FacebookReportsList';
import { IconChartHistogram } from '@tabler/icons-react';
import { ReportsView } from '@/report/components/ReportsView';
import { TicketReportsList } from '@/report/components/TicketReportsList';
import { useTranslation } from 'react-i18next';

export default function ReportIndexPage() {
  const { t } = useTranslation('frontline');
  const location = useLocation();
  const navigate = useNavigate();
  const activeSection = getReportSection(location.pathname);
  const sections = getReportSections(t);

  const activeSectionLabel =
    activeSection === 'overview'
      ? undefined
      : sections.find(({ section }) => section === activeSection)?.label;

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
    t('reports', 'Reports'),
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
                    {t('reports', 'Reports')}
                  </Link>
                </Button>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>
          <Separator.Inline />
          <ToggleGroup
            type="single"
            value={activeSection}
            onValueChange={(value) => {
              const target = sections.find(({ section }) => section === value);

              if (target) {
                navigate(REPORT_SECTION_PATHS[target.section]);
              }
            }}
          >
            {sections.map(({ section, label }) => (
              <ToggleGroup.Item key={section} value={section}>
                {label}
              </ToggleGroup.Item>
            ))}
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
