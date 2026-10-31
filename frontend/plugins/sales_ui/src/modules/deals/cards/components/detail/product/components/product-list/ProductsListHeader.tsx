import { Button, cn, Filter, Input, Label, Switch } from 'erxes-ui';
import { FilterButton, ProductFilterBar } from '../FilterButton';

import {
  IconArrowsMaximize,
  IconArrowsMinimize,
  IconSearch,
} from '@tabler/icons-react';
import { ProductFilterState } from '@/deals/actionBar/types/actionBarTypes';
import { useTranslation } from 'react-i18next';

interface ProductsListHeaderProps {
  filters: ProductFilterState;
  onFiltersChange: (filters: ProductFilterState) => void;
  vatPercent: number;
  vatPercentDraft: string | null;
  onVatPercentChange: (value: string) => void;
  onVatPercentBlur: () => void;
  onApplyVat: () => void;
  showAdvancedView: boolean;
  onShowAdvancedViewChange: (value: boolean) => void;
  showTaxView: boolean;
  onShowTaxViewChange: (value: boolean) => void;
  showExpandedView: boolean;
  onShowExpandedViewChange: (value: boolean) => void;
  compact?: boolean;
}

export const ProductsListHeader = ({
  filters,
  onFiltersChange,
  vatPercent,
  vatPercentDraft,
  onVatPercentChange,
  onVatPercentBlur,
  onApplyVat,
  showAdvancedView,
  onShowAdvancedViewChange,
  showTaxView,
  onShowTaxViewChange,
  showExpandedView,
  onShowExpandedViewChange,
  compact = false,
}: ProductsListHeaderProps) => {
  const { t } = useTranslation('sales');
  const ExpandedViewIcon = showExpandedView
    ? IconArrowsMinimize
    : IconArrowsMaximize;

  const viewToggles = (
    <>
      <div className="flex h-9 items-center gap-2">
        <Switch
          id="product-advanced-view"
          checked={showAdvancedView}
          onCheckedChange={onShowAdvancedViewChange}
        />
        <Label
          htmlFor="product-advanced-view"
          className="whitespace-nowrap text-xs font-medium"
        >
          {t('advanced-view')}
        </Label>
      </div>
      <div className="flex h-9 items-center gap-2">
        <Switch
          id="product-tax-view"
          checked={showTaxView}
          onCheckedChange={onShowTaxViewChange}
        />
        <Label
          htmlFor="product-tax-view"
          className="whitespace-nowrap text-xs font-medium"
        >
          {t('tax-view')}
        </Label>
      </div>
      <div
        className={cn(
          'flex h-9 items-center gap-2',
          !compact && 'rounded-md border px-2',
        )}
      >
        <Switch
          id="product-expanded-view"
          checked={showExpandedView}
          onCheckedChange={onShowExpandedViewChange}
        />
        <ExpandedViewIcon
          size={16}
          className="shrink-0 text-muted-foreground"
        />
        <Label
          htmlFor="product-expanded-view"
          className="whitespace-nowrap text-xs font-medium"
        >
          {t('expand-view')}
        </Label>
      </div>
    </>
  );

  return (
    <Filter id="product-filter">
      <div className="shrink-0 border-b pb-4">
        <div
          className={cn(
            'flex flex-col gap-3',
            !compact && 'xl:flex-row xl:items-center',
          )}
        >
          <div className="relative w-full max-w-2xl flex-1">
            <IconSearch
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={16}
            />
            <Input
              placeholder={t('search')}
              className="w-full pl-9"
              value={filters.productSearch || ''}
              onChange={(event) =>
                onFiltersChange({
                  ...filters,
                  productSearch: event.target.value,
                })
              }
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div
              className={cn(
                'flex items-center gap-2',
                compact && 'w-full [&>button]:shrink-0',
              )}
            >
              {compact && (
                <FilterButton
                  filters={filters}
                  onFilterChange={onFiltersChange}
                />
              )}
              <Label
                htmlFor="product-vat-percent"
                className={cn(
                  'whitespace-nowrap text-xs font-medium text-muted-foreground',
                  compact && 'ml-auto',
                )}
              >
                {t('vat-percent')}
              </Label>
              <Input
                id="product-vat-percent"
                type="number"
                min={0}
                max={100}
                step="any"
                className={cn(
                  'px-2 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
                  compact ? 'h-7 w-16 text-right' : 'h-9 w-20',
                )}
                value={vatPercentDraft ?? vatPercent}
                onChange={(event) => onVatPercentChange(event.target.value)}
                onBlur={onVatPercentBlur}
              />
              <Button
                type="button"
                variant={compact ? 'secondary' : 'outline'}
                size="sm"
                className={compact ? 'h-7' : 'h-9'}
                onClick={onApplyVat}
              >
                {t('apply')}
              </Button>
            </div>
          </div>
        </div>

        {compact ? (
          <>
            <div className="mt-2 flex flex-wrap gap-2 empty:hidden">
              <ProductFilterBar filters={filters} onChange={onFiltersChange} />
            </div>
            <div className="@container mt-1">
              <div className="grid grid-cols-1 gap-x-3 @md:grid-cols-3">
                {viewToggles}
              </div>
            </div>
          </>
        ) : (
          <div className="mt-2 flex min-h-9 items-center gap-2 overflow-x-auto">
            <FilterButton filters={filters} onFilterChange={onFiltersChange} />
            <ProductFilterBar
              filters={filters}
              onChange={onFiltersChange}
            />{' '}
            {viewToggles}
          </div>
        )}
      </div>
    </Filter>
  );
};
