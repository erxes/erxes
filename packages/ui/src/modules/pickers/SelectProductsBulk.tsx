import { IconPlus, IconX } from '@tabler/icons-react';
import {
  type InfiniteData,
  type QueryKey,
  skipToken,
  useInfiniteQuery,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';
import { type ReactElement, type ReactNode, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'use-debounce';
import { Button } from 'erxes-ui/components/button';
import { Input } from 'erxes-ui/components/input';
import { ScrollArea } from 'erxes-ui/components/scroll-area';
import { Separator } from 'erxes-ui/components/separator';
import { Sheet } from 'erxes-ui/components/sheet';
import { SkeletonArray } from 'erxes-ui/components/skeleton';
import { useFormat } from 'erxes-ui/lib/format';
import { toAmountInput } from 'erxes-ui/lib/money';
import type { ProductPage, ProductQueries, ProductRecord } from 'erxes-ui/modules/records/products';
import { ProductsInline, SelectCategory } from './SelectProducts';

/** Stock on hand by product id, from the plugin that keeps it. */
type RemainderQuery = (
  productIds: string[],
) => UseQueryOptions<Record<string, number>, Error, Record<string, number>>;

/** What `SelectProductsBulk` picks from and hands back. */
export interface BulkProps {
  /** `productQueries` from `@erxes/core-contract/client`. */
  products: ProductQueries;
  onSelect: (productIds: string[], products: ProductRecord[]) => void | Promise<void>;
  productIds?: string[];
  initialProducts?: ProductRecord[];
  selectionLimit?: number;
  isSelectionValid?: (productIds: string[], products: ProductRecord[]) => boolean;
  /** Each product's stock, shown beside it; the list puts the most first. */
  remainders?: RemainderQuery;
}

/** The catalog's products after `cursor`, a page at a time, for a search and category. */
const useProductPages = (products: ProductQueries, search: string, categoryId: string) => {
  const client = useQueryClient();
  const filter = { search: search || undefined, categoryId: categoryId || undefined };

  return useInfiniteQuery<ProductPage, Error, InfiniteData<ProductPage>, QueryKey, string | null>({
    queryKey: ['erxes-ui', 'product-pages', products.page(filter).queryKey],
    initialPageParam: null,
    queryFn: ({ pageParam }) =>
      client.query(products.page({ ...filter, cursor: pageParam ?? undefined })),
    getNextPageParam: (page) => (page.pageInfo.hasNextPage ? page.pageInfo.endCursor : null),
  });
};

const ProductListItem = ({
  product,
  remainder,
  disabled,
  onSelect,
}: {
  product: ProductRecord;
  remainder: number;
  disabled: boolean;
  onSelect: (product: ProductRecord) => void;
}) => {
  const fmt = useFormat();

  return (
    <Button
      variant="ghost"
      className="h-auto min-h-9 w-full justify-start whitespace-nowrap text-left font-normal"
      disabled={disabled}
      onClick={() => onSelect(product)}
    >
      <div className="flex flex-1 items-center gap-2">
        <span className="shrink-0 rounded border bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
          {product.code}
        </span>
        <span className="truncate">{product.name}</span>
        <span className="ml-auto flex shrink-0 items-center gap-2">
          <span className="text-xs font-medium tabular-nums">
            <span className="mr-0.5 font-normal text-muted-foreground">{product.currency}</span>
            {fmt.number(Number(toAmountInput(product.price, product.currency)))}
          </span>
          <span className="rounded border bg-muted px-1.5 py-0.5 text-xs tabular-nums text-muted-foreground">
            {remainder} {product.unit}
          </span>
        </span>
      </div>
      <IconPlus className="ml-2 shrink-0" />
    </Button>
  );
};

/** The catalog to pick from: a search, a category, then the products not picked yet. */
const ProductsList = ({
  products,
  remainders,
  pickedIds,
  full,
  onPick,
}: Pick<BulkProps, 'products' | 'remainders'> & {
  pickedIds: string[];
  full: boolean;
  onPick: (product: ProductRecord) => void;
}) => {
  const { t } = useTranslation('ui', { keyPrefix: 'product' });
  const [search, setSearch] = useState('');
  const [term] = useDebounce(search, 500);
  const [categoryId, setCategoryId] = useState('');
  const pages = useProductPages(products, term, categoryId);
  const rows = pages.data?.pages.flatMap((page) => page.data) ?? [];
  // Only the first page counts; the pages after it leave totalCount out.
  const totalCount = pages.data?.pages.at(0)?.totalCount ?? 0;

  const stock = useQuery(
    remainders && rows.length
      ? remainders(rows.map((row) => row.id))
      : { queryKey: ['erxes-ui', 'no-remainders'], queryFn: skipToken },
  );

  const remainderOf = (id: string) => stock.data?.[id] ?? 0;

  const { ref: bottomRef } = useInView({
    onChange: (inView) => inView && pages.hasNextPage && void pages.fetchNextPage(),
  });

  const available = rows
    .filter((row) => !pickedIds.includes(row.id))
    .toSorted((a, b) => remainderOf(b.id) - remainderOf(a.id));

  const shownTotal = Math.max(totalCount - (rows.length - available.length), 0);

  return (
    <div className="flex flex-col overflow-hidden border-r">
      <div className="p-4">
        <div className="flex items-center justify-between gap-4">
          <Input
            placeholder={t('search', 'Search products')}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <div className="flex w-48 shrink-0 items-center gap-2">
            <SelectCategory.Field
              products={products}
              value={categoryId}
              onValueChange={(next) => setCategoryId(typeof next === 'string' ? next : '')}
            />
          </div>
        </div>
        <div className="mt-4 text-xs text-accent-foreground">
          {!pages.isPending && t('results', '{{count}} results', { count: shownTotal })}
        </div>
      </div>
      <Separator />
      <div className="flex-1 overflow-auto">
        <div className="flex min-w-max flex-col gap-1 p-4">
          {pages.isPending ? (
            <SkeletonArray count={8} className="h-9 w-full" />
          ) : (
            available.map((product) => (
              <ProductListItem
                key={product.id}
                product={product}
                remainder={remainderOf(product.id)}
                disabled={full}
                onSelect={onPick}
              />
            ))
          )}
          {pages.hasNextPage && (
            <div className="flex min-h-px flex-col gap-1" ref={bottomRef}>
              {pages.isFetchingNextPage && <SkeletonArray count={3} className="h-9 w-full" />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/** The picked products, each a button that unpicks it. */
const PickedList = ({
  products,
  picked,
  pickedIds,
  onRemove,
}: {
  products: ProductQueries;
  picked: ProductRecord[];
  pickedIds: string[];
  onRemove: (productId: string) => void;
}) => {
  const { t } = useTranslation('ui', { keyPrefix: 'product' });

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-1 p-4">
        <div className="mb-1 px-3 text-xs text-accent-foreground">{t('added', 'Added')}</div>
        {pickedIds.map((productId) => (
          <Button
            key={productId}
            variant="ghost"
            className="h-auto min-h-9 max-w-full justify-start whitespace-normal text-left font-normal"
            onClick={() => onRemove(productId)}
          >
            <ProductsInline
              productIds={[productId]}
              products={picked.filter((product) => product.id === productId)}
              productQueries={products}
            />
            <IconX className="ml-auto" />
          </Button>
        ))}
      </div>
    </ScrollArea>
  );
};

/** The sheet's two lists and its footer; it mounts while the sheet is open. */
const BulkContent = ({
  products,
  onSelect,
  productIds,
  initialProducts,
  selectionLimit,
  isSelectionValid,
  remainders,
  close,
}: BulkProps & { close: () => void }) => {
  const { t } = useTranslation('ui', { keyPrefix: 'product' });
  const [pickedIds, setPickedIds] = useState(productIds ?? []);
  const [picked, setPicked] = useState(initialProducts ?? []);
  const [submitting, setSubmitting] = useState(false);
  const full = selectionLimit !== undefined && pickedIds.length >= selectionLimit;
  const resolved = pickedIds.every((id) => picked.some((product) => product.id === id));
  const valid = isSelectionValid?.(pickedIds, picked) ?? true;

  const submit = async () => {
    setSubmitting(true);

    try {
      await onSelect(pickedIds, picked);
      close();
    } catch {
      // The page's own call shows what failed; the sheet stays open to try again.
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Sheet.Content className="grid grid-cols-2 overflow-hidden p-0">
        <ProductsList
          products={products}
          remainders={remainders}
          pickedIds={pickedIds}
          full={full}
          onPick={(product) => {
            if (full) return;

            setPicked((rows) => [...rows, product]);
            setPickedIds((ids) => [...ids, product.id]);
          }}
        />
        <PickedList
          products={products}
          picked={picked}
          pickedIds={pickedIds}
          onRemove={(productId) => {
            setPicked((rows) => rows.filter((row) => row.id !== productId));
            setPickedIds((ids) => ids.filter((id) => id !== productId));
          }}
        />
      </Sheet.Content>
      <Sheet.Footer>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="secondary" onClick={close}>
            {t('cancel', 'Cancel')}
          </Button>
          <Button
            onClick={() => void submit()}
            disabled={submitting || pickedIds.length === 0 || !resolved || !valid}
          >
            {t('add-many', 'Add Many Products')}
          </Button>
        </div>
      </Sheet.Footer>
    </>
  );
};

/**
 * A sheet that picks many products at once, as 3.x's did.
 * The catalog with its stock (`remainders`) on the left, the picked ones on the right; Add hands
 * `onSelect` the ids. `children` is the button that opens it.
 */
export const SelectProductsBulk = ({
  children,
  open,
  onOpenChange,
  title,
  description,
  ...props
}: BulkProps & {
  children?: ReactElement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: ReactNode;
  description?: ReactNode;
}) => {
  const { t } = useTranslation('ui', { keyPrefix: 'product' });
  const [ownOpen, setOwnOpen] = useState(false);
  const shown = open ?? ownOpen;

  const setOpen = (next: boolean) => {
    if (open === undefined) setOwnOpen(next);

    onOpenChange?.(next);
  };

  return (
    <Sheet open={shown} onOpenChange={setOpen}>
      {children && <Sheet.Trigger render={children} />}
      <Sheet.View className="sm:max-w-6xl">
        <Sheet.Header>
          <Sheet.Title>{title ?? t('select-many', 'Select Products')}</Sheet.Title>
          {description && <Sheet.Description>{description}</Sheet.Description>}
          <Sheet.Close />
        </Sheet.Header>
        {shown && <BulkContent {...props} close={() => setOpen(false)} />}
      </Sheet.View>
    </Sheet>
  );
};
