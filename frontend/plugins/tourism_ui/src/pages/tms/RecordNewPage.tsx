import { useMemo } from 'react';
import {
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { PageContainer } from 'erxes-ui';
import {
  ISidePanelNavigator,
  NEW_RECORD_ID,
  PageHeader,
  SidePanelNavigatorContext,
  useSidePanel,
} from 'ui-modules';
import {
  TOURISM_NEW_RECORD_TYPES,
  TOURISM_RECORD_SECTIONS,
  getTourismBranchSectionPath,
  getTourismRecordDetailPath,
  toTourismContentType,
} from '@/tms/side-panel/tourismRecordPage';
import { RecordPageBreadcrumb } from '~/pages/tms/RecordDetailPage';
import { RECORD_PANELS, RecordPanel } from '~/widgets/record-panel/RecordPanel';

const keepTab = () => undefined;

export const RecordNewPage = () => {
  const { branchId = '', recordType = '' } = useParams<{
    branchId: string;
    recordType: string;
  }>();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { openRecord } = useSidePanel();
  const contentType = toTourismContentType(recordType);
  const panel = RECORD_PANELS[contentType];
  const listPath = getTourismBranchSectionPath(branchId, contentType);
  const navigator = useMemo<ISidePanelNavigator>(() => {
    const backToList = () => navigate(listPath);

    return {
      record: { contentType, contentId: NEW_RECORD_ID },
      tab: '',
      setTab: keepTab,
      openRecord: (entity, options) => {
        const hasRecordPage =
          entity.contentId !== NEW_RECORD_ID &&
          Boolean(TOURISM_RECORD_SECTIONS[entity.contentType]);

        if (options?.replace && hasRecordPage) {
          navigate(
            getTourismRecordDetailPath(entity.contentType)(
              encodeURIComponent(entity.contentId),
              pathname,
            ),
            { replace: true },
          );
          return;
        }

        openRecord(entity, options);
      },
      back: backToList,
      canGoBack: false,
      close: backToList,
    };
  }, [contentType, navigate, listPath, pathname, openRecord]);

  if (!panel?.New || !TOURISM_NEW_RECORD_TYPES.has(contentType)) {
    return <Navigate to={listPath} replace />;
  }

  return (
    <PageContainer>
      <SidePanelNavigatorContext.Provider value={navigator}>
        <PageHeader>
          <PageHeader.Start>
            <RecordPageBreadcrumb
              branchId={branchId}
              contentType={contentType}
              contentId={NEW_RECORD_ID}
            />
          </PageHeader.Start>
        </PageHeader>
        <div className="flex min-h-0 flex-1 flex-col pt-2">
          <RecordPanel
            contentType={contentType}
            contentId={NEW_RECORD_ID}
            view="new"
          />
        </div>
      </SidePanelNavigatorContext.Provider>
    </PageContainer>
  );
};
