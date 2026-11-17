import { SIMILARITY_CONTENT_TYPE } from '@/products/bulk-similarity/constants/similarityContentType';
import { SimilarityRecordPanel } from '@/products/bulk-similarity/components/panel/SimilarityRecordPanel';
import { ProductsPath } from '@/types/paths/ProductsPath';
import { PageContainer, useQueryState } from 'erxes-ui';
import { useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ISidePanelNavigator,
  RecordSidePanel,
  SidePanelNavigatorContext,
  useSidePanel,
} from 'ui-modules';

/**
 * A similarity group on its own page, where the side panel's expand button
 * leads: the panel's record view at full size.
 */
export const SimilarityDetailPage = () => {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { openRecord } = useSidePanel();
  const [tab, setTab] = useQueryState<string>('tab');
  const record = useMemo(
    () => ({ contentType: SIMILARITY_CONTENT_TYPE, contentId: id }),
    [id],
  );
  const backToList = useCallback(
    () => navigate(ProductsPath.Similarities),
    [navigate],
  );
  const navigator = useMemo<ISidePanelNavigator>(
    () => ({
      record,
      tab: tab ?? '',
      setTab,
      openRecord,
      back: backToList,
      canGoBack: false,
      close: backToList,
    }),
    [record, tab, setTab, openRecord, backToList],
  );

  return (
    <PageContainer className="min-w-0 flex-1">
      <SidePanelNavigatorContext.Provider value={navigator}>
        <RecordSidePanel expanded expandedMode="page" expandable={false}>
          <SimilarityRecordPanel
            key={id}
            record={record}
            onClose={backToList}
          />
        </RecordSidePanel>
      </SidePanelNavigatorContext.Provider>
    </PageContainer>
  );
};
