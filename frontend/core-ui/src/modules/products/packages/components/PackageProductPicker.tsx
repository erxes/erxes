import {
  IconAlertCircle,
  IconMinus,
  IconPackageOff,
  IconPlus,
  IconX,
} from '@tabler/icons-react';
import { Button, Combobox, Popover, Skeleton } from 'erxes-ui';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SelectProduct } from 'ui-modules';
import {
  type TPackageChosenProduct,
  usePackageChosenProducts,
} from '../hooks/usePackageChosenProducts';
import { IPackageProduct } from '../types/Package';

const MAX_QUANTITY = 999;

const formatNumber = (value?: number | null) =>
  value == null
    ? '—'
    : new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(
        value,
      );

const clampQuantity = (quantity: number) =>
  Math.min(MAX_QUANTITY, Math.max(1, quantity));

const QuantityStepper = ({
  quantity,
  onChange,
}: {
  quantity: number;
  onChange: (quantity: number) => void;
}) => {
  const { t } = useTranslation('product', { keyPrefix: 'package' });

  return (
    <div className="flex h-7 shrink-0 items-center rounded-md border">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-6"
        disabled={quantity <= 1}
        aria-label={t('decrease-quantity', 'Decrease quantity')}
        onClick={() => onChange(clampQuantity(quantity - 1))}
      >
        <IconMinus className="size-3" />
      </Button>
      <input
        type="number"
        min={1}
        max={MAX_QUANTITY}
        value={quantity}
        aria-label={t('quantity', 'Quantity')}
        onChange={(event) =>
          onChange(clampQuantity(Number.parseInt(event.target.value, 10) || 1))
        }
        className="w-8 bg-transparent text-center text-sm tabular-nums outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-6"
        disabled={quantity >= MAX_QUANTITY}
        aria-label={t('increase-quantity', 'Increase quantity')}
        onClick={() => onChange(clampQuantity(quantity + 1))}
      >
        <IconPlus className="size-3" />
      </Button>
    </div>
  );
};

const PackageProductLine = ({
  item,
  product,
  onQuantityChange,
  onRemove,
}: {
  item: IPackageProduct;
  product?: TPackageChosenProduct;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
}) => {
  const { t } = useTranslation('product', { keyPrefix: 'package' });
  const unitPrice = product ? Number(product.unitPrice) || 0 : null;

  return (
    // The controls drop below the name when the panel is too narrow for both.
    <li className="flex flex-wrap items-center gap-x-3 gap-y-1.5 px-3 py-2">
      <div className="flex min-w-32 flex-1 flex-col">
        <span className="truncate text-sm font-medium">
          {product?.name ||
            product?.code ||
            t('unavailable-product', 'Unavailable product')}
        </span>
        <span className="truncate text-xs text-muted-foreground">
          {[product?.code, `${formatNumber(unitPrice)} ${t('each', 'each')}`]
            .filter(Boolean)
            .join(' · ')}
        </span>
      </div>
      <div className="ml-auto flex shrink-0 items-center gap-3">
        <QuantityStepper quantity={item.quantity} onChange={onQuantityChange} />
        <span className="min-w-16 text-right text-sm tabular-nums">
          {formatNumber(unitPrice == null ? null : unitPrice * item.quantity)}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7 text-muted-foreground"
          aria-label={t('remove-product', 'Remove product')}
          onClick={onRemove}
        >
          <IconX className="size-4" />
        </Button>
      </div>
    </li>
  );
};

// Opens the shared product search; each pick adds or removes a product.
const PackageProductAdd = ({
  productIds,
  onChange,
}: {
  productIds: string[];
  onChange: (productIds: string[]) => void;
}) => {
  const { t } = useTranslation('product', { keyPrefix: 'package' });
  const [open, setOpen] = useState(false);

  return (
    <SelectProduct.Provider
      mode="multiple"
      value={productIds}
      onValueChange={(next) =>
        onChange(Array.isArray(next) ? next : [next].filter(Boolean))
      }
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <Button type="button" variant="ghost" size="sm">
            <IconPlus />
            {t('add-products', 'Add products')}
          </Button>
        </Popover.Trigger>
        <Combobox.Content align="end">
          <SelectProduct.Content />
        </Combobox.Content>
      </Popover>
    </SelectProduct.Provider>
  );
};

const PackageProductsEmpty = () => {
  const { t } = useTranslation('product', { keyPrefix: 'package' });

  return (
    <div className="flex flex-col items-center gap-1.5 rounded-lg border border-dashed px-4 py-6 text-center">
      <IconPackageOff className="size-5 text-muted-foreground" />
      <span className="text-sm font-medium">
        {t('no-package-products', 'No products yet')}
      </span>
      <span className="text-xs text-muted-foreground">
        {t(
          'no-package-products-description',
          'Add the products this package bundles; its total price follows them.',
        )}
      </span>
    </div>
  );
};

// Shown in place of the lines: without the products their names and prices
// are unknown.
const PackageProductsLoadError = ({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) => {
  const { t } = useTranslation('product', { keyPrefix: 'package' });

  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-1.5 rounded-lg border border-dashed px-4 py-6 text-center"
    >
      <IconAlertCircle className="size-5 text-destructive" />
      <span className="text-sm font-medium">
        {t('products-load-failed', 'Could not load the products')}
      </span>
      <span className="text-xs text-muted-foreground">{message}</span>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-1"
        onClick={onRetry}
      >
        {t('retry', 'Retry')}
      </Button>
    </div>
  );
};

/**
 * The products a package holds: found through the shared product search,
 * each listed with its quantity and line total.
 */
export const PackageProductPicker = ({
  value,
  onChange,
}: {
  value: IPackageProduct[];
  onChange: (items: IPackageProduct[]) => void;
}) => {
  const { t } = useTranslation('product', { keyPrefix: 'package' });
  const productIds = useMemo(
    () => value.map((item) => item.productId),
    [value],
  );
  const { products, loading, error, retry } =
    usePackageChosenProducts(productIds);
  const productMap = useMemo(
    () => new Map(products.map((product) => [product._id, product])),
    [products],
  );

  const choose = (nextIds: string[]) => {
    const kept = value.filter((item) => nextIds.includes(item.productId));
    const added = nextIds
      .filter((id) => !productIds.includes(id))
      .map((productId) => ({ productId, quantity: 1 }));
    onChange([...kept, ...added]);
  };

  const changeQuantity = (productId: string, quantity: number) =>
    onChange(
      value.map((item) =>
        item.productId === productId ? { ...item, quantity } : item,
      ),
    );

  const remove = (productId: string) =>
    onChange(value.filter((item) => item.productId !== productId));

  const showSkeleton = loading && !products.length;

  const renderProducts = () => {
    if (!value.length) return <PackageProductsEmpty />;
    // While Retry runs the lines show as loading again.
    if (error && !loading) {
      return (
        <PackageProductsLoadError message={error.message} onRetry={retry} />
      );
    }
    return (
      <ul className="divide-y rounded-lg border">
        {value.map((item) =>
          showSkeleton ? (
            <li key={item.productId} className="px-3 py-2.5">
              <Skeleton className="h-8 w-full" />
            </li>
          ) : (
            <PackageProductLine
              key={item.productId}
              item={item}
              product={productMap.get(item.productId)}
              onQuantityChange={(quantity) =>
                changeQuantity(item.productId, quantity)
              }
              onRemove={() => remove(item.productId)}
            />
          ),
        )}
      </ul>
    );
  };

  return (
    <section className="flex min-w-0 flex-col gap-1 pt-1">
      <div className="flex h-7 items-center justify-between gap-2 px-1">
        <h3 className="text-xs font-normal text-muted-foreground">
          {t('products-count', {
            count: value.length,
            defaultValue: 'Products ({{count}})',
          })}
        </h3>
        <PackageProductAdd productIds={productIds} onChange={choose} />
      </div>
      {renderProducts()}
    </section>
  );
};
