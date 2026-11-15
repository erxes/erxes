import { useQuery } from '@apollo/client';
import {
  Badge,
  Combobox,
  Command,
  EnumCursorDirection,
  ICursorListResponse,
  Popover,
  Spinner,
} from 'erxes-ui';
import { IconCheck, IconX } from '@tabler/icons-react';
import { type ReactNode, useState } from 'react';
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

interface IProductChooserListProps {
  excludeIds: string[];
  value?: string;
  valueCode?: string;
  onChoose: (product: ChoosableProduct) => void;
  onClear: () => void;
}

/**
 * Links an existing product to a generated row: a search list dropping
 * down from the row's button, so the panel stays in view.
 */
export const ProductChooser = ({
  children,
  excludeIds = [],
  onChoose,
  onClear,
  ...props
}: Omit<IProductChooserListProps, 'excludeIds'> & {
  children: ReactNode;
  excludeIds?: string[];
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>{children}</Popover.Trigger>
      <Combobox.Content align="end" className="min-w-80">
        <ProductChooserList
          {...props}
          excludeIds={excludeIds}
          onChoose={(product) => {
            onChoose(product);
            setOpen(false);
          }}
          onClear={() => {
            onClear();
            setOpen(false);
          }}
        />
      </Combobox.Content>
    </Popover>
  );
};

const ProductChooserList = ({
  excludeIds,
  value,
  valueCode,
  onChoose,
  onClear,
}: IProductChooserListProps) => {
  const { t } = useTranslation('product', { keyPrefix: 'bulk-similarity' });
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 400);

  const { data, loading, error, fetchMore } = useQuery<
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

  const renderStatus = () => {
    if (loading && !list.length) {
      return <Spinner containerClassName="py-6" />;
    }
    if (error) {
      return (
        <p className="px-2 py-6 text-sm text-center text-destructive">
          {error.message}
        </p>
      );
    }
    if (!visible.length) {
      return (
        <p className="px-2 py-6 text-sm text-center text-muted-foreground">
          {t('no-products-found', 'No products found.')}
        </p>
      );
    }
    return null;
  };

  return (
    <Command shouldFilter={false}>
      <Command.Input
        value={search}
        onValueChange={setSearch}
        placeholder={t('search-by-code-name', 'Search by code or name…')}
        aria-label={t(
          'chooser-description',
          'Search and choose a product to link into this similarity group',
        )}
      />
      <Command.List className="max-h-80 overflow-y-auto">
        {totalCount > 0 && (
          <p className="px-2 pt-2 pb-1 text-xs text-muted-foreground">
            {t('results', {
              count: totalCount,
              defaultValue: '{{count}} results',
            })}
          </p>
        )}

        {value && (
          <Command.Item
            value={`linked-${value}`}
            onSelect={onClear}
            title={t('unlink-product', 'Unlink this product')}
          >
            <IconCheck size={16} className="text-success shrink-0" />
            <span className="font-mono text-xs bg-muted border rounded px-1.5 py-0.5 text-muted-foreground shrink-0">
              {valueCode}
            </span>
            <span className="text-muted-foreground">
              {t('linked', 'Linked')}
            </span>
            <IconX size={14} className="ml-auto shrink-0" />
          </Command.Item>
        )}

        {visible.map((product) => {
          const inGroup = !!product.similarityId;

          return (
            <Command.Item
              key={product._id}
              value={product._id}
              disabled={inGroup}
              onSelect={() => onChoose(product)}
              title={
                inGroup
                  ? t('already-in-group', 'Already in a similarity group')
                  : undefined
              }
            >
              <span className="font-mono text-xs bg-muted border rounded px-1.5 py-0.5 text-muted-foreground shrink-0">
                {product.code}
              </span>
              <span className="truncate">{product.name}</span>
              <span className="flex gap-2 items-center ml-auto shrink-0">
                {inGroup && (
                  <Badge variant="secondary">
                    {t('in-a-group', 'in a group')}
                  </Badge>
                )}
                {product.unitPrice != null && (
                  <span className="text-xs font-medium tabular-nums">
                    <span className="mr-0.5 font-normal text-muted-foreground">
                      {product.currency ?? ''}
                    </span>
                    {product.unitPrice.toLocaleString()}
                  </span>
                )}
              </span>
            </Command.Item>
          );
        })}

        {renderStatus()}

        {list.length > 0 && list.length < totalCount && (
          <div className="flex gap-2 items-center px-2 h-8" ref={bottomRef}>
            <Spinner containerClassName="flex-none" />
            <span className="text-muted-foreground animate-pulse">
              {t('loading-more', 'Loading more…')}
            </span>
          </div>
        )}
      </Command.List>
    </Command>
  );
};
