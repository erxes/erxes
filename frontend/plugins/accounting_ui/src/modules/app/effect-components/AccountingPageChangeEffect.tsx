import { useEffect } from 'react';
import { AccountingHotkeyScope } from '@/types/AccountingHotkeyScope';
import { useIsMatchingLocation, useSetHotkeyScope } from 'erxes-ui';
import { AccountingPath } from '@/types/AccountingPath';

export const PageChangeEffect = () => {
  const isMatchingLocation = useIsMatchingLocation();
  const setHotkeyScope = useSetHotkeyScope();

  useEffect(() => {
    switch (true) {
      case isMatchingLocation(AccountingPath.Main): {
        setHotkeyScope(AccountingHotkeyScope.MainPage);
        break;
      }
      case isMatchingLocation(AccountingPath.Transaction): {
        setHotkeyScope(AccountingHotkeyScope.TransactionPage);
        break;
      }
      case isMatchingLocation(AccountingPath.TransactionCreate): {
        setHotkeyScope(AccountingHotkeyScope.TransactionFormPage);
        break;
      }
      case isMatchingLocation(AccountingPath.TransactionEdit): {
        setHotkeyScope(AccountingHotkeyScope.TransactionFormPage);
        break;
      }
    }
  }, [isMatchingLocation, setHotkeyScope]);

  return <></>;
};
