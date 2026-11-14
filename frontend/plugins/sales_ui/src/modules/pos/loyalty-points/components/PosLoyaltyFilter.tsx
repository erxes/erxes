import { IconSearch } from '@tabler/icons-react';
import {
  Combobox,
  Command,
  Filter,
  Skeleton,
  isUndefinedOrNull,
  useMultiQueryState,
} from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { SelectCustomer, SelectMember } from 'ui-modules';
import { SelectPos } from '@/pos/orders/components/selects/SelectPos';
import {
  POS_LOYALTY_FILTER_KEYS,
  TPosLoyaltyFilterState,
} from '../hooks/usePosLoyaltyVariables';
import { posLoyaltyCountAtom } from '../states';

const LoyaltyPointsCount = () => {
  const { t } = useTranslation('sales');
  const totalCount = useAtomValue(posLoyaltyCountAtom);

  return (
    <div className="text-muted-foreground font-medium text-sm whitespace-nowrap h-7 leading-7">
      {isUndefinedOrNull(totalCount) ? (
        <Skeleton className="w-20 h-4 inline-block mt-1.5" />
      ) : (
        t('loyalty-records-found', '{{count}} records found', {
          count: totalCount,
        })
      )}
    </div>
  );
};

/** The POS Loyalty points page's filters: every POS until chosen. */
export const PosLoyaltyFilter = () => {
  const { t } = useTranslation('sales');
  const [queries] = useMultiQueryState<TPosLoyaltyFilterState>(
    POS_LOYALTY_FILTER_KEYS,
  );
  const { search, pos, userId, customerId } = queries || {};
  const hasFilters = Object.values(queries || {}).some(
    (value) => value !== null,
  );

  return (
    <Filter id="sales-pos-loyalty-filter">
      <Filter.Bar className="overflow-auto styled-scroll">
        <div className="flex flex-wrap items-center gap-2">
          <Filter.Popover scope="sales-pos-loyalty-page">
            <Filter.Trigger isFiltered={hasFilters} />
            <Combobox.Content>
              <Filter.View>
                <Command>
                  <Command.List className="p-1">
                    <Filter.Item value="search" inDialog>
                      <IconSearch />
                      {t('search', 'Search')}
                    </Filter.Item>
                    <Command.Separator className="my-1" />
                    <SelectPos.FilterItem />
                    <SelectMember.FilterItem
                      value="userId"
                      label={t('loyalty-by-cashier', 'By Cashier')}
                    />
                    <SelectCustomer.FilterItem
                      value="customerId"
                      label={t('by-customer', 'By Customer')}
                    />
                  </Command.List>
                </Command>
              </Filter.View>
              <SelectPos.FilterView mode="multiple" />
              <SelectMember.FilterView mode="single" queryKey="userId" />
              <SelectCustomer.FilterView mode="single" filterKey="customerId" />
            </Combobox.Content>
          </Filter.Popover>
          <Filter.Dialog>
            <Filter.View filterKey="search" inDialog>
              <Filter.DialogStringView
                filterKey="search"
                label={t('search', 'Search')}
              />
            </Filter.View>
          </Filter.Dialog>
        </div>
        {search && (
          <Filter.BarItem queryKey="search">
            <Filter.BarName>
              <IconSearch />
              {t('search', 'Search')}
            </Filter.BarName>
            <Filter.BarButton filterKey="search" inDialog>
              {search}
            </Filter.BarButton>
          </Filter.BarItem>
        )}
        {pos && <SelectPos.FilterBar mode="multiple" />}
        {userId && (
          <SelectMember.FilterBar
            mode="single"
            queryKey="userId"
            label={t('loyalty-by-cashier', 'By Cashier')}
          />
        )}
        {customerId && (
          <SelectCustomer.FilterBar
            mode="single"
            filterKey="customerId"
            label={t('by-customer', 'By Customer')}
          />
        )}
        <LoyaltyPointsCount />
      </Filter.Bar>
    </Filter>
  );
};
