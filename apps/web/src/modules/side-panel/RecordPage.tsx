import { PageContainer, type RecordPageProps } from 'erxes-ui';
import { RecordSidePanel } from './RecordSidePanel';
import { useQueryState } from 'nuqs';
import { useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  type TPanelContentType,
  usePanelRecordType,
  useRecordPagePathOf,
} from './panelRecordTypes';
import { useRecordPageNavigation } from './panelNavigation';
import { type ISidePanelNavigator, SidePanelNavigatorContext } from './recordView';
import { SidePanelRecord } from './SidePanelLayout';
import { useSidePanel } from './useSidePanel';

/**
 * A record on its own page: the side panel's record view at full size, core's or a plugin's
 * (erxes-ui's `RecordPage`, which a plugin's `detailPath` route renders). Related records
 * still open in the side panel beside it. Closing goes to the page's `listPath`, else the type's.
 */
export const RecordPageView = ({ contentType, contentId, listPath: pageList }: RecordPageProps) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { openRecord } = useSidePanel();
  const { replacePage, backToPanel } = useRecordPageNavigation();
  const [tab, setTab] = useQueryState('tab');
  const { type } = usePanelRecordType(contentType);
  const pagePathOf = useRecordPagePathOf();
  const listPath = pageList ?? type?.listPath(pathname) ?? '/';
  const record = useMemo(() => ({ contentType, contentId }), [contentType, contentId]);

  const navigator = useMemo<ISidePanelNavigator>(() => {
    const backToList = () => {
      void navigate(listPath);
    };

    return {
      record,
      tab: tab ?? '',
      setTab: (next) => void setTab(next),
      openRecord,
      // Without a page of its own, the other record opens beside this one.
      replaceRecord: (next) => {
        const page = pagePathOf(next, pathname);

        if (page) replacePage(page);
        else openRecord(next);
      },
      back: backToList,
      canGoBack: false,
      close: backToList,
    };
  }, [record, tab, setTab, openRecord, navigate, listPath, pagePathOf, pathname, replacePage]);

  return (
    <PageContainer>
      <SidePanelNavigatorContext.Provider value={navigator}>
        {/* Collapsing puts the record back in the side panel, on the tab the page shows. */}
        <RecordSidePanel
          expanded
          expandedMode="page"
          onExpandedChange={() => backToPanel(record, tab ?? '', listPath)}
        >
          <SidePanelRecord key={contentId} record={record} />
        </RecordSidePanel>
      </SidePanelNavigatorContext.Provider>
    </PageContainer>
  );
};

/** Core's record pages: `/contacts/customers/:id`, `/products/:id`. */
export const RecordPage = ({ contentType }: { contentType: TPanelContentType }) => {
  const { id = '' } = useParams<{ id: string }>();

  return <RecordPageView contentType={contentType} contentId={id} />;
};
