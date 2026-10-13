import { useFilterContext, useMultiQueryState, useQueryState } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useLoyaltyAccountTypes } from '../../settings/account-type/hooks/useLoyaltyAccountTypes';
import { activeTiers } from '../../settings/account-type/types';
import {
  ACCOUNT_FILTER_KEYS,
  ACCOUNT_NO_TIER,
  ACCOUNT_OWNER_TYPE_OPTIONS,
  ACCOUNT_STATUS_OPTIONS,
} from '../constants/accountList';

type TOption = { value: string; label: string };

const OWNER_TYPE_LABELS: Record<string, string> = {
  customer: 'customer',
  company: 'company',
  user: 'team-member',
};

export const useLoyaltyAccountFilterOptions = () => {
  const { t } = useTranslation('loyalty');
  const { resetFilterState } = useFilterContext();
  const [queries] = useMultiQueryState<Record<string, string>>(
    Object.values(ACCOUNT_FILTER_KEYS),
  );
  // Changing the account type leaves any tier of the previous one behind.
  const [, setTier] = useQueryState<string>(ACCOUNT_FILTER_KEYS.tier);
  const [, setStatus] = useQueryState<string>(ACCOUNT_FILTER_KEYS.status);
  const [, setOwnerType] = useQueryState<string>(ACCOUNT_FILTER_KEYS.ownerType);
  const [, setAccountTypeId] = useQueryState<string>(
    ACCOUNT_FILTER_KEYS.accountTypeId,
  );
  const { accounts: accountTypes } = useLoyaltyAccountTypes({
    status: 'active',
  });

  const setters: Record<string, (value: string) => void> = {
    [ACCOUNT_FILTER_KEYS.status]: setStatus,
    [ACCOUNT_FILTER_KEYS.ownerType]: setOwnerType,
    [ACCOUNT_FILTER_KEYS.accountTypeId]: (value) => {
      setAccountTypeId(value);
      setTier(null);
    },
    [ACCOUNT_FILTER_KEYS.tier]: setTier,
  };

  const selectedAccountType = accountTypes.find(
    ({ _id }) => _id === queries?.accountTypeId,
  );

  const statusOptions: TOption[] = ACCOUNT_STATUS_OPTIONS.map((value) => ({
    value,
    label: t(`loyalty-account-status-${value}`),
  }));
  const ownerTypeOptions: TOption[] = ACCOUNT_OWNER_TYPE_OPTIONS.map(
    (value) => ({ value, label: t(OWNER_TYPE_LABELS[value]) }),
  );
  const accountTypeOptions: TOption[] = accountTypes.map(({ _id, name }) => ({
    value: _id,
    label: name,
  }));
  const tierOptions: TOption[] = [
    { value: ACCOUNT_NO_TIER, label: t('loyalty-tier-none') },
    ...activeTiers(selectedAccountType?.tiers).map(({ key, name }) => ({
      value: key,
      label: name,
    })),
  ];

  return {
    queries: queries || {},
    hasFilters: Object.values(queries || {}).some((value) => !!value),
    statusOptions,
    ownerTypeOptions,
    accountTypeOptions,
    tierOptions,
    labelOf: (options: TOption[], value?: string | null) =>
      options.find((option) => option.value === value)?.label || value || '',
    select: (filterKey: string, value: string) => {
      setters[filterKey]?.(value);
      resetFilterState();
    },
  };
};
