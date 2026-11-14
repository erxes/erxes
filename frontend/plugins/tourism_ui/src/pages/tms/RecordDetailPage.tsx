import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { IconBox, IconHierarchy2, IconHistory } from '@tabler/icons-react';
import {
  Breadcrumb,
  Button,
  PageContainer,
  Separator,
  useQueryState,
} from 'erxes-ui';
import {
  IRecordSidePanelTab,
  ISidePanelNavigator,
  PageHeader,
  RecordSidePanel,
  SidePanelNavigatorContext,
  useSidePanel,
} from 'ui-modules';
import { useBranchDetail } from '@/tms/hooks/BranchDetail';
import { TourismPanelIdentity } from '@/tms/side-panel/TourismPanelIdentity';
import { TourismRecordColumn } from '@/tms/side-panel/TourismRecordColumn';
import {
  ITourismPanelHeading,
  ITourismPanelViews,
  TOURISM_PANEL_TABS,
} from '@/tms/side-panel/tourismPanelTypes';
import {
  TOURISM_RECORD_SECTIONS,
  TourismRecordPageContext,
  getTourismBranchSectionPath,
  toTourismContentType,
} from '@/tms/side-panel/tourismRecordPage';
import { RECORD_PANELS, RecordPanel } from '~/widgets/record-panel/RecordPanel';

const ACTIVITY_TAB = 'activity';

const SECTION_LABELS: Record<string, string> = {
  tour: 'tour',
  itinerary: 'itinerary',
  elements: 'elements',
  amenities: 'amenities',
  category: 'category',
  customFields: 'custom-fields',
};

const useNoHeading = (): ITourismPanelHeading => ({});

const RecordHeading = ({
  contentId,
  panel,
}: {
  contentId: string;
  panel: ITourismPanelViews;
}) => {
  const { t } = useTranslation('tourism');
  const useHeading = panel.useHeading ?? useNoHeading;
  const { name, image } = useHeading(contentId);

  return (
    <TourismPanelIdentity name={name || t(panel.editLabel)} image={image} />
  );
};

export const RecordPageBreadcrumb = ({
  branchId,
  contentType,
  contentId,
}: {
  branchId: string;
  contentType: string;
  contentId: string;
}) => {
  const { t } = useTranslation('tourism');
  const { branchDetail } = useBranchDetail({ id: branchId });
  const section = TOURISM_RECORD_SECTIONS[contentType];

  return (
    <Breadcrumb>
      <Breadcrumb.List className="gap-1">
        <Breadcrumb.Item>
          <Button variant="ghost" asChild>
            <Link to="/tourism/tms">
              <IconBox />
              {t('tms-index-breadcrumb')}
            </Link>
          </Button>
        </Breadcrumb.Item>
        <Separator.Inline />
        <Breadcrumb.Item>
          <Button variant="ghost" asChild>
            <Link to={getTourismBranchSectionPath(branchId, contentType)}>
              {branchDetail?.name || t('unnamed-branch')} ·{' '}
              {t(SECTION_LABELS[section] ?? section)}
            </Link>
          </Button>
        </Breadcrumb.Item>
        <Separator.Inline />
        <Breadcrumb.Item>
          <Breadcrumb.Page className="max-w-80 truncate">
            <RecordPanel
              contentType={contentType}
              contentId={contentId}
              view="title"
            />
          </Breadcrumb.Page>
        </Breadcrumb.Item>
      </Breadcrumb.List>
    </Breadcrumb>
  );
};

export const RecordDetailPage = () => {
  const { t } = useTranslation('common', { keyPrefix: 'side-panel' });
  const { t: tourismT } = useTranslation('tourism');
  const {
    branchId = '',
    recordType = '',
    recordId = '',
  } = useParams<{ branchId: string; recordType: string; recordId: string }>();
  const navigate = useNavigate();
  const { openRecord } = useSidePanel();
  const [tab, setTab] = useQueryState<string>('tab');
  const contentType = toTourismContentType(recordType);
  const panel = RECORD_PANELS[contentType];
  const listPath = getTourismBranchSectionPath(branchId, contentType);
  const record = useMemo(
    () => ({ contentType, contentId: recordId }),
    [contentType, recordId],
  );
  const navigator = useMemo<ISidePanelNavigator>(() => {
    const backToList = () => navigate(listPath);

    return {
      record,
      tab: tab ?? '',
      setTab,
      openRecord,
      back: backToList,
      canGoBack: false,
      close: backToList,
    };
  }, [record, tab, setTab, openRecord, navigate, listPath]);

  if (!panel || !TOURISM_RECORD_SECTIONS[contentType]) {
    return <Navigate to={listPath} replace />;
  }

  const viewProps = { contentType, contentId: recordId };

  const tabs: IRecordSidePanelTab[] = [
    ...(panel.Properties
      ? [
          {
            value: 'properties',
            label: t('properties', 'Properties'),
            icon: IconHierarchy2,
            content: <RecordPanel {...viewProps} view="properties" />,
          },
        ]
      : []),
    ...(TOURISM_PANEL_TABS[contentType] ?? []).map((extraTab) => ({
      value: extraTab.value,
      label: extraTab.labelKey
        ? tourismT(extraTab.labelKey, { defaultValue: extraTab.label })
        : extraTab.label,
      icon: extraTab.icon,
      content: <RecordPanel {...viewProps} view="tab" tab={extraTab.value} />,
    })),
    {
      value: ACTIVITY_TAB,
      label: t('activity', 'Activity'),
      icon: IconHistory,
      content: <RecordPanel {...viewProps} view="activity" />,
    },
  ];
  const selectedTab =
    tab && tabs.some((entry) => entry.value === tab) ? tab : ACTIVITY_TAB;

  return (
    <PageContainer>
      <SidePanelNavigatorContext.Provider value={navigator}>
        <TourismRecordPageContext.Provider value>
          <PageHeader>
            <PageHeader.Start>
              <RecordPageBreadcrumb
                branchId={branchId}
                contentType={contentType}
                contentId={recordId}
              />
            </PageHeader.Start>
            <PageHeader.End>
              <RecordPanel {...viewProps} view="actions" />
            </PageHeader.End>
          </PageHeader>
          <div className="flex min-h-0 flex-1">
            <TourismRecordColumn
              header={<RecordHeading contentId={recordId} panel={panel} />}
            >
              <div className="flex min-h-0 flex-1 flex-col px-2 pt-2">
                <RecordPanel {...viewProps} view="detail" />
              </div>
            </TourismRecordColumn>
            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
              <RecordSidePanel.Tabs
                key={recordId}
                tabs={tabs}
                value={selectedTab}
                onValueChange={setTab}
                visibleCount={tabs.length}
              />
            </div>
          </div>
        </TourismRecordPageContext.Provider>
      </SidePanelNavigatorContext.Provider>
    </PageContainer>
  );
};
