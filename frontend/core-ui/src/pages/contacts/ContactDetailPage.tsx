import {
  getContactListPath,
  TContactContentType,
} from '@/contacts/utils/contactDetailPath';
import { SidePanelRecord } from '@/side-panel/components/SidePanelLayout';
import { PageContainer, useQueryState } from 'erxes-ui';
import { useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  ISidePanelNavigator,
  RecordSidePanel,
  SidePanelNavigatorContext,
  useSidePanel,
} from 'ui-modules';

/**
 * A customer or company on its own page: the side panel's record view at full
 * size. Related records still open in the side panel beside it.
 */
export const ContactDetailPage = ({
  contentType,
}: {
  contentType: TContactContentType;
}) => {
  const { id = '' } = useParams<{ id: string }>();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { openRecord } = useSidePanel();
  const [tab, setTab] = useQueryState<string>('tab');
  const listPath = getContactListPath(contentType, pathname);
  const record = useMemo(
    () => ({ contentType, contentId: id }),
    [contentType, id],
  );

  const backToList = () => navigate(listPath);

  const navigator: ISidePanelNavigator = {
    record,
    tab: tab ?? '',
    setTab,
    openRecord,
    back: backToList,
    canGoBack: false,
    close: backToList,
  };

  return (
    <PageContainer>
      <SidePanelNavigatorContext.Provider value={navigator}>
        <RecordSidePanel expanded expandedMode="page" expandable={false}>
          <SidePanelRecord key={id} record={record} onClose={backToList} />
        </RecordSidePanel>
      </SidePanelNavigatorContext.Provider>
    </PageContainer>
  );
};
