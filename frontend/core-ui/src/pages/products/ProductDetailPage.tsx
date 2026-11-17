import { PRODUCT_CONTENT_TYPE } from '@/products/constants/productQueryKey';
import { ProductRecordPanel } from '@/products/product-detail/components/panel/ProductRecordPanel';
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
 * A product on its own page, where the side panel's expand button leads: the
 * panel's record view at full size, with related records opening beside it.
 */
export const ProductDetailPage = () => {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { openRecord } = useSidePanel();
  const [tab, setTab] = useQueryState<string>('tab');
  const record = useMemo(
    () => ({ contentType: PRODUCT_CONTENT_TYPE, contentId: id }),
    [id],
  );
  const backToList = useCallback(
    () => navigate(ProductsPath.Products),
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
          <ProductRecordPanel key={id} record={record} onClose={backToList} />
        </RecordSidePanel>
      </SidePanelNavigatorContext.Provider>
    </PageContainer>
  );
};
