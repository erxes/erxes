import type { Product } from '@erxes/core-contract';
import { IconArchive, IconDots, IconPackage, IconRestore } from '@tabler/icons-react';
import { Badge, Button, Command, Popover } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppBreadcrumb } from '~/components/AppBreadcrumb';
import { RecordPageHeader } from '~/modules/side-panel/RecordPageHeader';
import { paths } from '~/lib/paths';
import { useCanManageProducts, useProductStatus } from '../useProducts';

/** "Archived" on an archived product, then its "more" menu: archive or restore (managers only). */
export const ProductPanelActions = ({ product }: { product: Product }) => {
  const { t } = useTranslation('product');
  const [open, setOpen] = useState(false);
  const manage = useCanManageProducts();
  const { archive, restore } = useProductStatus();
  const archived = product.status === 'archived';

  return (
    <>
      {archived && <Badge variant="secondary">{t('status.archived', 'Archived')}</Badge>}
      {manage && (
        <Popover open={open} onOpenChange={setOpen}>
          <Popover.Trigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                aria-label={t('panel.actions', 'Product actions')}
                title={t('panel.actions', 'Product actions')}
              />
            }
          >
            <IconDots className="size-4" />
          </Popover.Trigger>
          <Popover.Content
            variant="flush"
            className="min-w-56"
            align="end"
            side="bottom"
            sideOffset={8}
          >
            <Command>
              <Command.List>
                <Command.Item
                  disabled={archive.isPending || restore.isPending}
                  onSelect={() => {
                    setOpen(false);
                    (archived ? restore : archive).mutate({ id: product.id });
                  }}
                >
                  {archived ? <IconRestore /> : <IconArchive />}
                  {archived ? t('actions.restore', 'Restore') : t('actions.archive', 'Archive')}
                </Command.Item>
              </Command.List>
            </Command>
          </Popover.Content>
        </Popover>
      )}
    </>
  );
};

/** A product page's header: Products › its name, then its actions. */
export const ProductPageHeader = ({ product }: { product: Product }) => {
  const { t } = useTranslation('product');

  return (
    <RecordPageHeader
      breadcrumb={
        <AppBreadcrumb
          items={[
            { label: t('products', 'Products'), to: paths.products.list, icon: IconPackage },
            { label: product.name, to: paths.products.product(product.id) },
          ]}
        />
      }
      actions={<ProductPanelActions product={product} />}
    />
  );
};
