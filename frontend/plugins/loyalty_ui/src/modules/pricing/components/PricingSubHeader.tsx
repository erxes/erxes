import {
  Combobox,
  Filter,
  PageSubHeader,
  Skeleton,
  useMultiQueryState,
} from 'erxes-ui';
import { usePricing } from '@/pricing/hooks/usePricing';
import {
  PricingFilterBar,
  PricingFilterView,
  SingleDateTimeDialogContent,
} from '@/pricing/components/PricingFilter';

type PricingFilterState = {
  searchValue?: string | null;
  status?: string | null;
  branchId?: string | null;
  departmentId?: string | null;
  productId?: string | null;
  isPriority?: string | null;
  date?: string | null;
  isQuantityEnabled?: boolean | null;
  isPriceEnabled?: boolean | null;
  isExpiryEnabled?: boolean | null;
  isRepeatEnabled?: boolean | null;
  [key: string]: string | boolean | null | undefined;
};

export function PricingSubHeader() {
  const { totalCount, loading } = usePricing();
  const [queries] = useMultiQueryState<PricingFilterState>([
    'searchValue',
    'status',
    'branchId',
    'departmentId',
    'productId',
    'isPriority',
    'date',
    'isQuantityEnabled',
    'isPriceEnabled',
    'isExpiryEnabled',
    'isRepeatEnabled',
  ]);

  const hasFilters = Object.values(queries || {}).some(
    (value) => value !== null,
  );

  return (
    <Filter id="pricing">
      <PageSubHeader>
        <Filter.Bar>
          <PricingFilterBar queries={queries} />
          <Filter.Popover scope="pricing-page">
            <Filter.Trigger isFiltered={hasFilters} />
            <Combobox.Content>
              <PricingFilterView />
            </Combobox.Content>
          </Filter.Popover>
          <Filter.Dialog>
            <Filter.View filterKey="searchValue" inDialog>
              <Filter.DialogStringView filterKey="searchValue" />
            </Filter.View>
            <Filter.View filterKey="date" inDialog>
              <SingleDateTimeDialogContent />
            </Filter.View>
          </Filter.Dialog>

          <div className="h-7 text-sm font-medium leading-7 whitespace-nowrap text-muted-foreground">
            {totalCount
              ? `${totalCount} records found`
              : loading && (
                  <Skeleton className="w-20 h-4 inline-block mt-1.5" />
                )}
          </div>
        </Filter.Bar>
      </PageSubHeader>
    </Filter>
  );
}
