import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { IconFileText, IconHistory } from '@tabler/icons-react';
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
import { CONTENT_CMS_LIST } from '@/cms/graphql/queries';
import { ContentPanelIdentity } from '@/cms/shared/side-panel/ContentPanelIdentity';
import { ContentRecordColumn } from '@/cms/shared/side-panel/ContentRecordColumn';
import {
  CONTENT_WEB_CONTENT_TYPE,
  IContentPanelHeading,
  IContentPanelViews,
} from '@/cms/shared/side-panel/contentPanelTypes';
import {
  CONTENT_GLOBAL_RECORD_LISTS,
  CONTENT_WEBSITE_RECORD_SECTIONS,
  getContentRecordListPath,
  toContentType,
} from '@/cms/shared/side-panel/contentRecordPage';
import { IWebsite } from '@/cms/types';
import { RECORD_PANELS, RecordPanel } from '~/widgets/record-panel/RecordPanel';

const ACTIVITY_TAB = 'activity';

const SECTION_LABELS: Record<string, string> = {
  tags: 'tags',
  categories: 'categories',
  menus: 'menus',
  'custom-types': 'custom-post-types',
  'custom-fields': 'custom-fields',
};

const useNoHeading = (): IContentPanelHeading => ({});

const RecordHeading = ({
  contentId,
  panel,
}: {
  contentId: string;
  panel: IContentPanelViews;
}) => {
  const { t } = useTranslation('content');
  const useHeading = panel.useHeading ?? useNoHeading;
  const { name, image } = useHeading(contentId);

  return (
    <ContentPanelIdentity name={name || t(panel.editLabel)} image={image} />
  );
};

const RecordPageBreadcrumb = ({
  websiteId,
  contentType,
  contentId,
  listPath,
}: {
  websiteId: string;
  contentType: string;
  contentId: string;
  listPath: string;
}) => {
  const { t } = useTranslation('content');
  const { data } = useQuery<{ contentCMSList: IWebsite[] }>(CONTENT_CMS_LIST, {
    skip: !websiteId,
  });
  const websiteName =
    data?.contentCMSList?.find(
      (website) => website.clientPortalId === websiteId,
    )?.name || t('website');
  const section = CONTENT_WEBSITE_RECORD_SECTIONS[contentType];
  const isWebBuilder = contentType === CONTENT_WEB_CONTENT_TYPE;

  return (
    <Breadcrumb>
      <Breadcrumb.List className="gap-1">
        <Breadcrumb.Item>
          <Button variant="ghost" asChild>
            <Link to={isWebBuilder ? listPath : '/content/cms'}>
              <IconFileText />
              {isWebBuilder ? 'Web Builder' : t('cms')}
            </Link>
          </Button>
        </Breadcrumb.Item>
        {websiteId && section && (
          <>
            <Separator.Inline />
            <Breadcrumb.Item>
              <Button variant="ghost" asChild>
                <Link to={listPath}>
                  {websiteName} · {t(SECTION_LABELS[section] ?? section)}
                </Link>
              </Button>
            </Breadcrumb.Item>
          </>
        )}
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
  const {
    websiteId = '',
    recordType = '',
    recordId = '',
  } = useParams<{ websiteId: string; recordType: string; recordId: string }>();
  const navigate = useNavigate();
  const { openRecord } = useSidePanel();
  const [tab, setTab] = useQueryState<string>('tab');
  const contentType = toContentType(recordType);
  const panel = RECORD_PANELS[contentType];
  const listPath = getContentRecordListPath(contentType, websiteId);
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

  const hasPage =
    CONTENT_WEBSITE_RECORD_SECTIONS[contentType] ||
    CONTENT_GLOBAL_RECORD_LISTS[contentType];

  if (!panel || !hasPage) {
    return <Navigate to={listPath} replace />;
  }

  const viewProps = { contentType, contentId: recordId };

  const tabs: IRecordSidePanelTab[] = [
    {
      value: ACTIVITY_TAB,
      label: t('activity', 'Activity'),
      icon: IconHistory,
      content: <RecordPanel {...viewProps} view="activity" />,
    },
  ];

  return (
    <PageContainer>
      <SidePanelNavigatorContext.Provider value={navigator}>
        <PageHeader>
          <PageHeader.Start>
            <RecordPageBreadcrumb
              websiteId={websiteId}
              contentType={contentType}
              contentId={recordId}
              listPath={listPath}
            />
          </PageHeader.Start>
          <PageHeader.End>
            <RecordPanel {...viewProps} view="actions" />
          </PageHeader.End>
        </PageHeader>
        <div className="flex min-h-0 flex-1">
          <ContentRecordColumn
            header={<RecordHeading contentId={recordId} panel={panel} />}
          >
            <div className="flex min-h-0 flex-1 flex-col px-2 pt-2">
              <RecordPanel {...viewProps} view="detail" />
            </div>
          </ContentRecordColumn>
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <RecordSidePanel.Tabs
              key={recordId}
              tabs={tabs}
              value={ACTIVITY_TAB}
              onValueChange={setTab}
              visibleCount={tabs.length}
            />
          </div>
        </div>
      </SidePanelNavigatorContext.Provider>
    </PageContainer>
  );
};
