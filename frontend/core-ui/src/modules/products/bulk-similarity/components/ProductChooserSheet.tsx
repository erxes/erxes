import { useQuery } from '@apollo/client';
import {
  Badge,
  Button,
  EnumCursorDirection,
  ICursorListResponse,
  Input,
  Sheet,
  Spinner,
} from 'erxes-ui';
import { IconCheck, IconX } from '@tabler/icons-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useInView } from 'react-intersection-observer';
import { useDebounce } from 'use-debounce';
import { SIMILARITY_SEARCH_PRODUCTS } from '../graphql/queries';

export interface ChoosableProduct {
  _id: string;
  code: string;
  name?: string;
  unitPrice?: number;
  currency?: string;
  similarityId?: string;
}

const PER_PAGE = 30;

interface ProductChooserSheetProps {
  children: React.ReactNode;
  excludeIds?: string[];
  value?: string;
  valueCode?: string;
  onChoose: (product: ChoosableProduct) => void;
  onClear: () => void;
}

export const ProductChooserSheet = ({
  children,
  excludeIds = [],
  value,
  valueCode,
  onChoose,
  onClear,
}: ProductChooserSheetProps) => {
  const { t } = useTranslation('product', { keyPrefix: 'bulk-similarity' });
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Sheet.Trigger asChild>{children}</Sheet.Trigger>
      <Sheet.View className="sm:max-w-2xl">
        <Sheet.Header>
          <Sheet.Title>{t('products', 'Products')}</Sheet.Title>
          <Sheet.Close />
          <Sheet.Description className="sr-only">
            {t(
              'chooser-description',
              'Search and choose a product to link into this similarity group',
            )}
          </Sheet.Description>
        </Sheet.Header>
        {open && (
          <ChooserBody
            excludeIds={excludeIds}
            value={value}
            valueCode={valueCode}
            onChoose={(product) => {
              onChoose(product);
              setOpen(false);
            }}
            onClear={() => {
              onClear();
            }}
          />
        )}
      </Sheet.View>
    </Sheet>
  );
};

const ChooserBody = ({
  excludeIds,
  value,
  valueCode,
  onChoose,
  onClear,
}: {
  excludeIds: string[];
  value?: string;
  valueCode?: string;
  onChoose: (product: ChoosableProduct) => void;
  onClear: () => void;
}) => {
  const { t } = useTranslation('product', { keyPrefix: 'bulk-similarity' });
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 400);

  const { data, loading, fetchMore } = useQuery<
    ICursorListResponse<ChoosableProduct>
  >(SIMILARITY_SEARCH_PRODUCTS, {
    variables: {
      searchValue: debouncedSearch || undefined,
      limit: PER_PAGE,
    },
  });

  const { list = [], totalCount = 0, pageInfo } = data?.productsMain || {};

  const handleFetchMore = () => {
    if (!pageInfo || totalCount <= list.length) return;
    fetchMore({
      variables: {
        cursor: pageInfo.endCursor,
        direction: EnumCursorDirection.FORWARD,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return {
          productsMain: {
            ...fetchMoreResult.productsMain,
            list: [
              ...(prev.productsMain?.list || []),
              ...fetchMoreResult.productsMain.list,
            ],
          },
        };
      },
    });
  };

  const { ref: bottomRef } = useInView({
    onChange: (inView) => inView && handleFetchMore(),
  });

  const visible = list.filter(
    (p) => !excludeIds.includes(p._id) && p._id !== value,
  );

  return (
    <>
      <div className="flex gap-2 items-center px-5 py-3 border-b flex-none">
        <Input
          placeholder={t('search-by-code-name', 'Search by code or name…')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
        />
        <span className="text-xs text-muted-foreground shrink-0">
          {t('results', { count: totalCount, defaultValue: '{{count}} results' })}
        </span>
      </div>
      <Sheet.Content className="overflow-auto p-0">
        <div className="flex flex-col gap-1 p-4">
          {value && (
            <Button
              type="button"
              variant="secondary"
              className="justify-start w-full h-auto min-h-9 font-normal text-left"
              onClick={onClear}
              title={t('unlink-product', 'Unlink this product')}
            >
              <IconCheck size={16} className="text-success shrink-0" />
              <div className="flex flex-auto gap-2 items-center min-w-0">
                <span className="font-mono text-xs bg-muted border rounded px-1.5 py-0.5 text-muted-foreground shrink-0">
                  {valueCode}
                </span>
                <span className="text-muted-foreground">{t('linked', 'Linked')}</span>
              </div>
              <IconX size={14} className="ml-auto shrink-0" />
            </Button>
          )}

          {visible.map((product) => {
            const inGroup = !!product.similarityId;

            return (
              <Button
                key={product._id}
                type="button"
                variant="ghost"
                className="justify-start w-full h-auto min-h-9 font-normal text-left"
                onClick={() => onChoose(product)}
                disabled={inGroup}
                title={
                  inGroup
                    ? t('already-in-group', 'Already in a similarity group')
                    : undefined
                }
              >
                <div className="flex flex-auto gap-2 items-center min-w-0">
                  <span className="font-mono text-xs bg-muted border rounded px-1.5 py-0.5 text-muted-foreground shrink-0">
                    {product.code}
                  </span>
                  <span className="truncate">{product.name}</span>
                  <span className="flex gap-2 items-center ml-auto shrink-0">
                    {inGroup && <Badge variant="secondary">{t('in-a-group', 'in a group')}</Badge>}
                    {product.unitPrice != null && (
                      <span className="text-xs font-medium tabular-nums">
                        <span className="mr-0.5 font-normal text-muted-foreground">
                          {product.currency ?? ''}
                        </span>
                        {product.unitPrice.toLocaleString()}
                      </span>
                    )}
                  </span>
                </div>
              </Button>
            );
          })}

          {!loading && !visible.length && (
            <div className="px-2 py-8 text-sm text-center text-muted-foreground">
              {t('no-products-found', 'No products found.')}
            </div>
          )}

          {list.length < totalCount && (
            <div className="flex gap-2 items-center px-2 h-8" ref={bottomRef}>
              <Spinner containerClassName="flex-none" />
              <span className="text-muted-foreground animate-pulse">
                {t('loading-more', 'Loading more…')}
              </span>
            </div>
          )}
        </div>
      </Sheet.Content>
    </>
  );
};
