import {
  IconLabelFilled,
  IconProgressCheck,
  IconStairs,
  IconWallet,
} from '@tabler/icons-react';
import { Combobox, Command, Filter } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  ACCOUNT_FILTER_KEYS,
  LOYALTY_ACCOUNT_CURSOR_SESSION_KEY,
} from '../constants/accountList';
import { useLoyaltyAccountFilterOptions } from '../hooks/useLoyaltyAccountFilterOptions';
import { LoyaltyAccountTotalCount } from './LoyaltyAccountTotalCount';

type TOption = { value: string; label: string };

const OptionsView = ({
  filterKey,
  options,
  selected,
  onSelect,
}: {
  filterKey: string;
  options: TOption[];
  selected?: string | null;
  onSelect: (filterKey: string, value: string) => void;
}) => (
  <Filter.View filterKey={filterKey}>
    <Command>
      <Command.List>
        {options.map(({ value, label }) => (
          <Command.Item
            key={value}
            value={value}
            onSelect={() => onSelect(filterKey, value)}
          >
            {label}
            <Combobox.Check checked={selected === value} />
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  </Filter.View>
);

const BarItem = ({
  queryKey,
  icon: Icon,
  label,
  value,
}: {
  queryKey: string;
  icon: typeof IconWallet;
  label: string;
  value?: string;
}) => (
  <Filter.BarItem queryKey={queryKey}>
    <Filter.BarName>
      <Icon />
      {label}
    </Filter.BarName>
    <Filter.BarButton filterKey={queryKey}>{value}</Filter.BarButton>
  </Filter.BarItem>
);

export const LoyaltyAccountFilter = () => {
  const { t } = useTranslation('loyalty');
  const {
    queries,
    hasFilters,
    statusOptions,
    ownerTypeOptions,
    accountTypeOptions,
    tierOptions,
    labelOf,
    select,
  } = useLoyaltyAccountFilterOptions();

  return (
    <Filter
      id="loyalty-account-filter"
      sessionKey={LOYALTY_ACCOUNT_CURSOR_SESSION_KEY}
    >
      <Filter.Bar>
        <Filter.SearchValueBarItem />
        <BarItem
          queryKey={ACCOUNT_FILTER_KEYS.status}
          icon={IconProgressCheck}
          label={t('status')}
          value={labelOf(statusOptions, queries.accountStatus)}
        />
        <BarItem
          queryKey={ACCOUNT_FILTER_KEYS.ownerType}
          icon={IconLabelFilled}
          label={t('owner-type')}
          value={labelOf(ownerTypeOptions, queries.accountOwnerType)}
        />
        <BarItem
          queryKey={ACCOUNT_FILTER_KEYS.accountTypeId}
          icon={IconWallet}
          label={t('loyalty-account-type')}
          value={labelOf(accountTypeOptions, queries.accountTypeId)}
        />
        {queries.accountTypeId && (
          <BarItem
            queryKey={ACCOUNT_FILTER_KEYS.tier}
            icon={IconStairs}
            label={t('loyalty-tier')}
            value={labelOf(tierOptions, queries.accountTier)}
          />
        )}
        <Filter.Popover>
          <Filter.Trigger isFiltered={hasFilters} />
          <Combobox.Content>
            <Filter.View>
              <Command>
                <Filter.CommandInput
                  placeholder={t('filter')}
                  variant="secondary"
                  className="bg-background"
                />
                <Command.List className="p-1">
                  <Filter.SearchValueTrigger />
                  <Filter.Item value={ACCOUNT_FILTER_KEYS.status}>
                    <IconProgressCheck />
                    {t('status')}
                  </Filter.Item>
                  <Filter.Item value={ACCOUNT_FILTER_KEYS.ownerType}>
                    <IconLabelFilled />
                    {t('owner-type')}
                  </Filter.Item>
                  <Filter.Item value={ACCOUNT_FILTER_KEYS.accountTypeId}>
                    <IconWallet />
                    {t('loyalty-account-type')}
                  </Filter.Item>
                  {queries.accountTypeId && tierOptions.length > 1 && (
                    <Filter.Item value={ACCOUNT_FILTER_KEYS.tier}>
                      <IconStairs />
                      {t('loyalty-tier')}
                    </Filter.Item>
                  )}
                </Command.List>
              </Command>
            </Filter.View>
            <OptionsView
              filterKey={ACCOUNT_FILTER_KEYS.status}
              options={statusOptions}
              selected={queries.accountStatus}
              onSelect={select}
            />
            <OptionsView
              filterKey={ACCOUNT_FILTER_KEYS.ownerType}
              options={ownerTypeOptions}
              selected={queries.accountOwnerType}
              onSelect={select}
            />
            <OptionsView
              filterKey={ACCOUNT_FILTER_KEYS.accountTypeId}
              options={accountTypeOptions}
              selected={queries.accountTypeId}
              onSelect={select}
            />
            <OptionsView
              filterKey={ACCOUNT_FILTER_KEYS.tier}
              options={tierOptions}
              selected={queries.accountTier}
              onSelect={select}
            />
          </Combobox.Content>
        </Filter.Popover>
        <Filter.Dialog>
          <Filter.View filterKey="searchValue" inDialog>
            <Filter.DialogStringView filterKey="searchValue" />
          </Filter.View>
        </Filter.Dialog>
        <LoyaltyAccountTotalCount />
      </Filter.Bar>
    </Filter>
  );
};
