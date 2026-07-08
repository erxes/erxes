import {
  IconChevronDown,
  IconChevronUp,
  IconPackageOff,
} from '@tabler/icons-react';
import { Checkbox, InfoCard, Spinner, cn } from 'erxes-ui';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useInView } from 'react-intersection-observer';
import { IProduct } from 'ui-modules';
import { useProducts } from 'ui-modules/modules/products/hooks/useProducts';
import { IPackageProduct } from '../types/Package';

const formatNumber = (value?: number | null) =>
  value == null
    ? '—'
    : new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(
        value,
      );

const clamp = (n: number) => Math.min(999, Math.max(1, n));

const QtyControl = ({
  qty,
  disabled,
  onChange,
}: {
  qty: number;
  disabled?: boolean;
  onChange: (qty: number) => void;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      onChange(clamp(qty + (e.deltaY < 0 ? 1 : -1)));
    },
    [qty, onChange],
  );

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  return (
    <div className="flex items-center gap-0.5 shrink-0">
      <input
        ref={inputRef}
        type="number"
        min={1}
        max={999}
        value={qty}
        disabled={disabled}
        onChange={(e) => onChange(clamp(parseInt(e.target.value, 10) || 1))}
        className="box-content bg-transparent border-0 outline-none w-8 tabular-nums text-sm text-center [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [appearance:textfield]"
      />
      <div className="flex flex-col">
        <button
          type="button"
          disabled={disabled || qty >= 999}
          onClick={() => onChange(clamp(qty + 1))}
          className="flex justify-center items-center disabled:opacity-30 size-3 text-foreground/60 hover:text-foreground disabled:cursor-not-allowed"
        >
          <IconChevronUp className="size-2.5" />
        </button>
        <button
          type="button"
          disabled={disabled || qty <= 1}
          onClick={() => onChange(clamp(qty - 1))}
          className="flex justify-center items-center disabled:opacity-30 size-3 text-foreground/60 hover:text-foreground disabled:cursor-not-allowed"
        >
          <IconChevronDown className="size-2.5" />
        </button>
      </div>
    </div>
  );
};

const ProductRow = ({
  product,
  item,
  disabled,
  onToggle,
  onQtyChange,
}: {
  product: Pick<IProduct, '_id' | 'name' | 'code' | 'unitPrice'>;
  item?: IPackageProduct;
  disabled?: boolean;
  onToggle: (id: string) => void;
  onQtyChange: (id: string, qty: number) => void;
}) => {
  const checked = !!item;

  const handleRowClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('input,button')) return;
    onToggle(product._id);
  };

  return (
    <div
      className={cn(
        'flex items-center gap-3 hover:bg-accent px-3 py-1 transition-colors cursor-pointer',
        checked && 'bg-primary/5',
        disabled && 'opacity-60 cursor-not-allowed',
      )}
      onClick={handleRowClick}
    >
      <Checkbox
        checked={checked}
        disabled={disabled}
        onCheckedChange={() => onToggle(product._id)}
        className="pointer-events-none shrink-0"
      />
      <span className="flex-auto min-w-0 font-medium text-sm truncate">
        {product.name || product.code || product._id}
      </span>
      <div className="flex items-center gap-3 shrink-0">
        {product.code && (
          <span className="max-w-28 font-mono text-muted-foreground text-xs truncate">
            {product.code}
          </span>
        )}
        <span className="tabular-nums text-muted-foreground text-sm">
          {formatNumber(product.unitPrice)}
        </span>
        <QtyControl
          qty={item?.quantity ?? 1}
          disabled={disabled || !checked}
          onChange={(qty) => onQtyChange(product._id, qty)}
        />
      </div>
    </div>
  );
};

export const PackageProductPicker = ({
  value,
  onChange,
  onTotalChange,
  disabled,
}: {
  value: IPackageProduct[];
  onChange: (items: IPackageProduct[]) => void;
  onTotalChange?: (total: number) => void;
  disabled?: boolean;
}) => {
  const { t } = useTranslation('product', { keyPrefix: 'package' });
  const { products, loading, handleFetchMore, totalCount } = useProducts({
    variables: {},
  });

  const itemMap = useMemo(
    () => new Map(value.map((p) => [p.productId, p])),
    [value],
  );

  const priceCache = useRef<Record<string, number>>({});

  const computeTotal = (items: IPackageProduct[]) =>
    items.reduce(
      (sum, p) => sum + (priceCache.current[p.productId] || 0) * p.quantity,
      0,
    );

  useEffect(() => {
    for (const p of products) {
      priceCache.current[p._id] = Number(p.unitPrice) || 0;
    }
    onTotalChange?.(computeTotal(value));
  }, [products]);

  const handleToggle = (productId: string) => {
    const next = itemMap.has(productId)
      ? value.filter((p) => p.productId !== productId)
      : [...value, { productId, quantity: 1 }];
    onChange(next);
    onTotalChange?.(computeTotal(next));
  };

  const handleQtyChange = (productId: string, qty: number) => {
    const next = value.map((p) =>
      p.productId === productId ? { ...p, quantity: qty } : p,
    );
    onChange(next);
    onTotalChange?.(computeTotal(next));
  };

  const hasMore = products.length < totalCount;

  const { ref: sentinelRef } = useInView({
    skip: !hasMore || loading,
    onChange: (inView) => {
      if (inView) handleFetchMore();
    },
  });

  return (
    <InfoCard
      title={t('products-count', {
        count: value.length,
        defaultValue: 'Products ({{count}})',
      })}
      className="flex-auto overflow-hidden"
    >
      <InfoCard.Content className="p-0 overflow-auto">
        {loading && !products.length ? (
          <div className="flex justify-center items-center gap-2 py-12 text-muted-foreground text-sm">
            <Spinner /> {t('loading-products', 'Loading products…')}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col justify-center items-center gap-2 py-12 text-muted-foreground text-sm text-center">
            <IconPackageOff className="opacity-60 size-6" />
            <span>{t('no-products-found', 'No products found.')}</span>
          </div>
        ) : (
          <ul className="divide-y">
            {products.map((p) => (
              <li key={p._id}>
                <ProductRow
                  product={p}
                  item={itemMap.get(p._id)}
                  disabled={disabled}
                  onToggle={handleToggle}
                  onQtyChange={handleQtyChange}
                />
              </li>
            ))}
            {hasMore && (
              <li
                ref={sentinelRef}
                className="flex justify-center items-center gap-2 py-3 text-muted-foreground text-sm"
              >
                <Spinner className="size-4" />
              </li>
            )}
          </ul>
        )}
      </InfoCard.Content>
    </InfoCard>
  );
};
