import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLoyaltyAccountTypes } from '../../settings/account-type/hooks/useLoyaltyAccountTypes';
import { loyaltyAccountColumns } from '../components/loyaltyAccountColumns';
import { useLoyaltyAccountList } from './useLoyaltyAccountList';

export const useLoyaltyAccountTable = () => {
  const { t } = useTranslation('loyalty');
  const listState = useLoyaltyAccountList();
  const { accounts: accountTypes } = useLoyaltyAccountTypes({
    status: 'active',
  });

  const columns = useMemo(
    () => loyaltyAccountColumns(t, accountTypes),
    [accountTypes, t],
  );

  return {
    ...listState,
    columns,
    // The table keeps column state by id; a new account type needs a remount.
    columnsKey: columns.map(({ id }) => id).join('|'),
  };
};
