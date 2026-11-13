import type { Product } from '@erxes/core-contract';
import { IconAlignLeft, IconHierarchy2, IconId } from '@tabler/icons-react';
import { Skeleton, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { ContactPanelIdentity } from '~/modules/side-panel/details/ContactPanelActions';
import {
  type IRecordSidePanelTab,
  RecordSidePanel,
  usePanelExpanded,
} from '~/modules/side-panel/RecordSidePanel';
import type { IRecordViewProps } from '~/modules/side-panel/recordView';
import { SidePanelFailed } from '~/modules/side-panel/SidePanelEmpty';
import { useSidePanel } from '~/modules/side-panel/useSidePanel';
import { useProduct } from '../useProducts';
import { ProductPageHeader, ProductPanelActions } from './ProductPanelActions';
import { ProductDescription, ProductPanelDetail } from './ProductPanelDetail';
import { ProductFieldset, ProductPanelName } from './ProductPanelFields';
import { ProductAvatar } from './ProductPanelImages';
import { ProductPanelProperties } from './ProductPanelProperties';

const DETAIL_TAB = 'detail';
const PROPERTIES_TAB = 'properties';
const DESCRIPTION_TAB = 'description';

/** Detail and Properties; a full page adds Description, as for contacts. */
const useProductTabs = (product: Product): IRecordSidePanelTab[] => {
  const { t } = useTranslation('common', { keyPrefix: 'side-panel' });
  const expanded = usePanelExpanded();

  const tabs: IRecordSidePanelTab[] = [
    {
      value: DETAIL_TAB,
      label: t('detail', 'Detail'),
      icon: IconId,
      content: <ProductPanelDetail product={product} />,
    },
    {
      value: PROPERTIES_TAB,
      label: t('properties', 'Properties'),
      icon: IconHierarchy2,
      content: <ProductPanelProperties product={product} />,
    },
  ];

  if (!expanded) return tabs;

  return [
    ...tabs,
    {
      value: DESCRIPTION_TAB,
      label: t('description', 'Description'),
      icon: IconAlignLeft,
      content: <ProductDescription product={product} fullSize />,
    },
  ];
};

/** A loaded product: its header, then its tabs. */
const ProductPanelView = ({
  product,
  onBack,
  onClose,
}: Omit<IRecordViewProps, 'record'> & { product: Product }) => {
  const expanded = usePanelExpanded();
  const { tab: selectedTab, setTab } = useSidePanel();
  const tabs = useProductTabs(product);
  const avatar = <ProductAvatar product={product} />;

  const name = (
    <ProductFieldset>
      <ProductPanelName product={product} />
    </ProductFieldset>
  );

  const tab =
    selectedTab && tabs.some((entry) => entry.value === selectedTab) ? selectedTab : DETAIL_TAB;

  return (
    <>
      {expanded ? (
        <ProductPageHeader product={product} />
      ) : (
        <RecordSidePanel.Header
          avatar={avatar}
          title={name}
          actions={<ProductPanelActions product={product} />}
          onBack={onBack}
          onClose={onClose}
        />
      )}
      <RecordSidePanel.Layout
        tabs={tabs}
        value={tab}
        onValueChange={setTab}
        visibleCount={8}
        overviewTab={DETAIL_TAB}
        overviewHeader={<ContactPanelIdentity title={name} avatar={avatar} />}
        expandedDefaultTab={PROPERTIES_TAB}
      />
    </>
  );
};

/** A saved product in the side panel, or on its own page (`/products/:id`). */
export const ProductPanel = ({ record, onBack, onClose }: IRecordViewProps) => {
  const query = useProduct(record.contentId);

  if (query.data)
    return <ProductPanelView product={query.data} onBack={onBack} onClose={onClose} />;

  if (query.isPending) {
    return (
      <>
        <RecordSidePanel.Header
          avatar={<Skeleton className="size-7 flex-none rounded" />}
          title={<Skeleton className="h-4 w-32" />}
          onBack={onBack}
          onClose={onClose}
        />
        <Spinner containerClassName="py-12" />
      </>
    );
  }

  return <SidePanelFailed error={query.error} onBack={onBack} onClose={onClose} />;
};
