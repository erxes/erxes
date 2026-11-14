import { PageContainer } from 'erxes-ui';
import { useQueryState } from 'nuqs';
import { useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { panelRecordType, type TPanelContentType } from './panelRecordTypes';
import { RecordSidePanel } from './RecordSidePanel';
import { type ISidePanelNavigator, SidePanelNavigatorContext } from './recordView';
import { SidePanelRecord } from './SidePanelLayout';
import { useSidePanel } from './useSidePanel';

/**
 * A record on its own page (`/contacts/customers/:id`, `/products/:id`): the
 * side panel's record view at full size. Related records still open in the
 * side panel beside it.
 */
export const RecordPage = ({ contentType }: { contentType: TPanelContentType }) => {
  const { id = '' } = useParams<{ id: string }>();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { openRecord } = useSidePanel();
  const [tab, setTab] = useQueryState('tab');
  const listPath = panelRecordType(contentType)?.listPath(pathname) ?? '/';
  const record = useMemo(() => ({ contentType, contentId: id }), [contentType, id]);

  const backToList = () => {
    void navigate(listPath);
  };

  const navigator: ISidePanelNavigator = {
    record,
    tab: tab ?? '',
    setTab: (next) => void setTab(next),
    openRecord,
    back: backToList,
    canGoBack: false,
    close: backToList,
  };

  return (
    <PageContainer>
      <SidePanelNavigatorContext.Provider value={navigator}>
        <RecordSidePanel expanded expandedMode="page" expandable={false}>
          <SidePanelRecord key={id} record={record} />
        </RecordSidePanel>
      </SidePanelNavigatorContext.Provider>
    </PageContainer>
  );
};
