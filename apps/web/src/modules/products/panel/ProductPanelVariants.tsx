import type { Product } from '@erxes/core-contract';
import { IconArrowUpRight, IconPackage, IconPlus, IconAdjustments } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { Button, PanelField, PanelSection, Spinner, useMoney, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { messageOf, orpc } from '@erxes/core-contract/client';
import { ContactTextField, useEmptyText } from '~/modules/side-panel/details/ContactDetailFields';
import { useCanManageProducts, useOpenProduct, useProduct, useProductCreate } from '../useProducts';
import { PRODUCT_PANEL_SCOPE } from './ProductPanelFields';
import { useProductEdit } from './useProductEdit';

/** `{ Size: 'M', Color: 'Red' }` as `Size: M, Color: Red`. */
const formatVariantOptions = (options: Record<string, string>) =>
  Object.entries(options)
    .map(([name, value]) => `${name}: ${value}`)
    .join(', ');

/** `Size: M, Color: Red` back to options; `null` when an entry has no `name: value`. */
const parseVariantOptions = (text: string): Record<string, string> | null => {
  const options: Record<string, string> = {};

  for (const part of text.split(',')) {
    if (!part.trim()) continue;

    const at = part.indexOf(':');
    const name = part.slice(0, Math.max(at, 0)).trim();
    const value = part.slice(at + 1).trim();

    if (at < 0 || !name || !value) return null;

    options[name] = value;
  }

  return options;
};

/** A variant: the item it belongs to, and the options that set it apart. */
const VariantOf = ({ product, parentId }: { product: Product; parentId: string }) => {
  const { t } = useTranslation('product');
  const { toast } = useToast();
  const manage = useCanManageProducts();
  const edit = useProductEdit();
  const empty = useEmptyText();
  const { openProduct } = useOpenProduct();
  const item = useProduct(parentId);

  const saveOptions = (text: string | null) => {
    const variantOptions = parseVariantOptions(text ?? '');

    if (!variantOptions) {
      toast({
        variant: 'destructive',
        title: t('variants.options-invalid', 'Write options as “Size: M, Color: Red”'),
      });

      return;
    }

    edit.mutate({ id: product.id, variantOptions });
  };

  return (
    <PanelSection title={t('variants.title', 'Variants')} nested>
      <PanelField icon={IconPackage} label={t('variants.of', 'Variant of')} cell={false}>
        <Button
          variant="ghost"
          size="sm"
          className="justify-start"
          onClick={() => openProduct(parentId, { stack: true })}
        >
          {item.data?.name ?? <Spinner size="sm" />}
          <IconArrowUpRight aria-hidden="true" />
        </Button>
      </PanelField>
      <PanelField icon={IconAdjustments} label={t('variants.options', 'Options')}>
        <ContactTextField
          scope={`${PRODUCT_PANEL_SCOPE}.${product.id}.variantOptions`}
          value={formatVariantOptions(product.variantOptions)}
          placeholder={empty}
          icon={IconAdjustments}
          onSave={saveOptions}
        />
      </PanelField>
      {manage && (
        <Button
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={() => edit.mutate({ id: product.id, parentId: null, variantOptions: {} })}
        >
          {t('variants.detach', 'Make it a product of its own')}
        </Button>
      )}
    </PanelSection>
  );
};

/** An item: its variants, and a button that adds one like it. */
const VariantList = ({ product }: { product: Product }) => {
  const { t } = useTranslation('product');
  const { toast } = useToast();
  const money = useMoney();
  const manage = useCanManageProducts();
  const { openProduct } = useOpenProduct();
  const create = useProductCreate();

  const variants = useQuery(
    orpc.products.list.queryOptions({ input: { parentId: product.id, limit: 100 } }),
  );

  const addVariant = () =>
    create.mutate(
      {
        kind: product.kind,
        name: product.name,
        parentId: product.id,
        categoryId: product.categoryId,
        unit: product.unit,
        price: product.price,
        currency: product.currency,
        tagIds: product.tagIds,
      },
      {
        onSuccess: (variant) => openProduct(variant.id, { stack: true }),
        onError: (error) =>
          toast({
            variant: 'destructive',
            title: t('save-failed', 'Could not save the product'),
            description: messageOf(error),
          }),
      },
    );

  const rows = variants.data?.data ?? [];

  return (
    <PanelSection title={t('variants.title', 'Variants')} nested>
      {variants.isPending && <Spinner size="sm" />}
      {!variants.isPending && rows.length === 0 && (
        <p className="px-1 text-sm text-muted-foreground">
          {t('variants.none', 'No variants. Add one for each size, color or model.')}
        </p>
      )}
      <ul className="flex flex-col">
        {rows.map((variant) => (
          <li key={variant.id}>
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-sm px-1 py-1.5 text-left text-sm hover:bg-accent"
              onClick={() => openProduct(variant.id, { stack: true })}
            >
              <span className="min-w-0 flex-1 truncate">
                {formatVariantOptions(variant.variantOptions) || variant.name}
              </span>
              {variant.code && (
                <span className="truncate text-xs text-muted-foreground">{variant.code}</span>
              )}
              <span className="tabular-nums">{money(variant.price, variant.currency)}</span>
            </button>
          </li>
        ))}
      </ul>
      {manage && (
        <Button
          variant="outline"
          size="sm"
          className="mt-2"
          disabled={create.isPending}
          onClick={addVariant}
        >
          <IconPlus aria-hidden="true" />
          {t('variants.add', 'Add variant')}
        </Button>
      )}
    </PanelSection>
  );
};

/** The Variants section: a variant's item and options, or an item's variants. */
export const ProductPanelVariants = ({ product }: { product: Product }) =>
  product.parentId ? (
    <VariantOf product={product} parentId={product.parentId} />
  ) : (
    <VariantList product={product} />
  );
