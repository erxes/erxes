import {
  IconId,
  IconListCheck,
  IconPackage,
  IconPhoto,
} from '@tabler/icons-react';
import { Button, Empty, Spinner } from 'erxes-ui';
import { type ReactNode, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  type IRecordSidePanelTab,
  type IRecordViewProps,
  RecordSidePanel,
  usePanelExpanded,
  usePermissionCheck,
  useSidePanel,
} from 'ui-modules';
import { ContactPanelIdentity } from '@/side-panel/components/details/ContactPanelActions';
import { PanelReadOnlyTab } from '@/products/product-detail/components/panel/PanelReadOnlyTab';
import { ProductPanelBreadcrumb } from '@/products/product-detail/components/panel/ProductPanelBreadcrumb';
import { useSavingValue } from '@/products/product-detail/hooks/useSavingValue';
import { ProductsPath } from '@/types/paths/ProductsPath';
import { usePackageDetail } from '../../hooks/usePackageDetail';
import {
  TPackagePatch,
  usePackagePanelSave,
} from '../../hooks/usePackagePanelSave';
import { IPackage, IPackageProduct } from '../../types/Package';
import {
  priceFromPercent,
  toPackageProductsInput,
} from '../../utils/packagePricing';
import { PackagePanelActions } from './PackagePanelActions';
import { PackagePanelFields } from './PackagePanelFields';
import { PackagePanelMedia } from './PackagePanelMedia';
import { PackagePanelProducts } from './PackagePanelProducts';

// A read-only package's changes are never sent.
const skipSave = () => Promise.resolve<IPackage | null>(null);

// The Products tab of a saved package: a change shows at once and saves;
// the price then follows the new total as the discount sets it.
const SavedPackageProducts = ({
  pkg,
  save,
}: {
  pkg: IPackage;
  save: (patch: TPackagePatch) => Promise<IPackage | null>;
}) => {
  const saveProducts = async (products: IPackageProduct[]) => {
    const saved = await save({ products });
    if (!saved) return null;
    const price = priceFromPercent(saved.totalPrice, saved.percent);
    return price !== null && price !== saved.price ? save({ price }) : saved;
  };
  const [products, setProducts] = useSavingValue(
    useMemo(() => toPackageProductsInput(pkg.products), [pkg.products]),
    saveProducts,
  );

  return <PackagePanelProducts value={products} onChange={setProducts} />;
};

/**
 * A package in the app's side panel
 * (`?panel=/detail/core:productPackage/<id>`): its fields, cover image and
 * products as tabs, each change saved as it is made. Expanded, it is the
 * package's own page. Without `productsUpdate` it is shown read-only.
 */
export const PackageRecordPanel = ({
  record,
  onBack,
  onClose,
}: IRecordViewProps) => {
  const { t } = useTranslation('product', { keyPrefix: 'package' });
  const packageId = record.contentId;
  const { hasActionPermission } = usePermissionCheck();
  const { package: pkg, loading, error, refetch } = usePackageDetail(packageId);
  const { save } = usePackagePanelSave(packageId);
  const { tab: selectedTab, setTab, dismissPath, path } = useSidePanel();
  const expanded = usePanelExpanded();

  const title = expanded
    ? pkg?.name || t('package-detail')
    : t('package-detail');

  const header = (
    <RecordSidePanel.Header
      className={expanded ? 'h-10 bg-background px-3' : undefined}
      title={
        expanded ? (
          <ProductPanelBreadcrumb
            title={title}
            to={ProductsPath.Packages}
            label={t('packages', 'Packages')}
            icon={IconPackage}
          />
        ) : (
          title
        )
      }
      actions={
        pkg && (
          <PackagePanelActions
            packageId={pkg._id}
            // On its own page it goes back to the list; in the panel, to the
            // record before it.
            onDeleted={() =>
              !expanded && path ? dismissPath(path) : onClose()
            }
          />
        )
      }
      onBack={onBack}
      onClose={onClose}
    />
  );

  if (loading && !pkg) {
    return (
      <>
        {header}
        <Spinner containerClassName="py-12" />
      </>
    );
  }

  if (!pkg) {
    return (
      <>
        {header}
        <Empty className="py-12">
          <Empty.Header>
            <Empty.Title>
              {error
                ? t('load-failed', 'Could not load the package')
                : t('package-not-found')}
            </Empty.Title>
            {error && <Empty.Description>{error.message}</Empty.Description>}
          </Empty.Header>
          {error && (
            <Empty.Content>
              <Button onClick={() => refetch()}>{t('retry', 'Retry')}</Button>
            </Empty.Content>
          )}
        </Empty>
      </>
    );
  }

  const readOnlyReason = hasActionPermission('productsUpdate')
    ? null
    : t('no-update-permission', 'You can view this package but not edit it.');
  const saveField = readOnlyReason ? skipSave : save;
  const editable = (content: ReactNode) => (
    <PanelReadOnlyTab reason={readOnlyReason}>{content}</PanelReadOnlyTab>
  );

  const tabs: IRecordSidePanelTab[] = [
    {
      value: 'detail',
      label: t('details', 'Details'),
      icon: IconId,
      content: editable(
        <PackagePanelFields
          key={pkg._id}
          pkg={pkg}
          total={pkg.totalPrice ?? null}
          save={saveField}
        />,
      ),
    },
    {
      value: 'media',
      label: t('media', 'Media'),
      icon: IconPhoto,
      content: editable(<PackagePanelMedia pkg={pkg} save={saveField} />),
    },
    {
      value: 'products',
      label: t('products-count', {
        count: pkg.products?.length ?? 0,
      }),
      icon: IconListCheck,
      content: editable(<SavedPackageProducts pkg={pkg} save={saveField} />),
    },
  ];
  const tab = tabs.some(({ value }) => value === selectedTab)
    ? selectedTab
    : 'detail';

  return (
    <RecordSidePanel.Layout
      header={header}
      overviewHeader={<ContactPanelIdentity title={t('details', 'Details')} />}
      visibleCount={tabs.length}
      value={tab}
      onValueChange={setTab}
      tabs={tabs}
    />
  );
};
