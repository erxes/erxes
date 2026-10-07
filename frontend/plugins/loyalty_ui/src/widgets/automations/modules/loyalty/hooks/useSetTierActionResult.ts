import { useTranslation } from 'react-i18next';
import { IAutomationHistoryAction } from 'ui-modules';
import { useLoyaltyAccountTypes } from '~/modules/loyalties/settings/account-type/hooks/useLoyaltyAccountTypes';

// Mirrors loyalty_api's set-tier producer result per owner.
type TSetTierResult = {
  ownerId: string;
  from?: string | null;
  to?: string | null;
  changed?: boolean;
};

const isSetTierResult = (value: unknown): value is TSetTierResult =>
  !!value &&
  typeof value === 'object' &&
  typeof (value as TSetTierResult).ownerId === 'string';

export const useSetTierActionResult = (action: IAutomationHistoryAction) => {
  const { t } = useTranslation('loyalty');
  const { accounts } = useLoyaltyAccountTypes();
  const accountType = accounts.find(
    ({ _id }) => _id === action.actionConfig?.accountTypeId,
  );

  const tierName = (key?: string | null) =>
    key
      ? accountType?.tiers?.find((tier) => tier.key === key)?.name || key
      : t('loyalty-tier-none');

  const rows: unknown[] = Array.isArray(action.result?.result)
    ? action.result.result
    : [];
  const owners = rows
    .filter(isSetTierResult)
    .map(({ ownerId, from, to, changed }) => ({
      ownerId,
      from: tierName(from),
      to: tierName(to),
      changed: changed !== false,
    }));

  return {
    owners,
    hasManyOwners: owners.length > 1,
    isUnchanged: owners.length > 0 && owners.every(({ changed }) => !changed),
  };
};
