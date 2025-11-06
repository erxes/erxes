import {
  Combobox,
  Tooltip,
  isUndefinedOrNull,
} from 'erxes-ui';
import {
  AccountsInlineContext,
  useAccountsInlineContext,
} from '../contexts/AccountsInlineContext';
import { useEffect, useState } from 'react';
import { IAccount } from '../types/Account';
import { useAccountsInline } from '../hooks/useAccounts';

export const AccountsInlineProvider = ({
  children,
  accountIds,
  accounts,
  placeholder,
  updateAccounts,
  allowUnassigned,
}: {
  children?: React.ReactNode;
  accountIds?: string[];
  accounts?: IAccount[];
  placeholder?: string;
  updateAccounts?: (accounts: IAccount[]) => void;
  allowUnassigned?: boolean;
}) => {
  const [_accounts, _setAccounts] = useState<IAccount[]>(accounts || []);

  return (
    <AccountsInlineContext.Provider
      value={{
        accounts: accounts || _accounts,
        loading: false,
        accountIds: accountIds || [],
        placeholder: isUndefinedOrNull(placeholder)
          ? 'Select Accounts'
          : placeholder,
        updateAccounts: updateAccounts || _setAccounts,
        allowUnassigned,
      }}
    >
      <Tooltip.Provider>{children}</Tooltip.Provider>
      {accountIds?.some(
        (id) => !accounts?.some((account) => account._id === id),
      ) && (
          <AccountsInlineEffectComponent
            missingAccountIds={accountIds.filter(
              (id) => !accounts?.some((account) => account._id === id),
            )}
          />
        )}
    </AccountsInlineContext.Provider>
  );
};

const AccountsInlineEffectComponent = ({
  missingAccountIds,
}: {
  missingAccountIds: string[];
}) => {
  const { updateAccounts, accounts } = useAccountsInlineContext();
  const { accounts: missingAccounts } = useAccountsInline({
    variables: {
      ids: missingAccountIds,
    },
  });

  useEffect(() => {
    if (missingAccounts && missingAccounts.length > 0) {
      const existingAccountsMap = new Map(
        accounts.map((account) => [account._id, account]),
      );
      const newAccounts = missingAccounts.filter(
        (account) => !existingAccountsMap.has(account._id),
      );

      if (newAccounts.length > 0) {
        updateAccounts?.([...accounts, ...newAccounts]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [missingAccounts, missingAccountIds]);

  return null;
};

export const AccountsInlineTitle = ({ className }: { className?: string }) => {
  const { accounts, loading, placeholder, allowUnassigned } =
    useAccountsInlineContext();

  const getDisplayValue = () => {
    if (!accounts || accounts.length === 0) {
      if (allowUnassigned) {
        return (
          <span className="capitalize text-muted-foreground/80">
            No assignee
          </span>
        );
      }
      return undefined;
    }

    const account = accounts[0];

    if (accounts.length === 1) {
      return `${account.code} - ${account.name}`;
    }

    return `${account.code}...${accounts.length - 1} accounts`;
  };

  return (
    <Combobox.Value
      value={getDisplayValue()}
      loading={loading}
      placeholder={placeholder}
      className={className}
    />
  );
};

export const AccountsInlineRoot = ({
  accountIds,
  accounts,
  placeholder,
  updateAccounts,
  className,
  allowUnassigned,
}: {
  accounts?: IAccount[];
  accountIds?: string[];
  placeholder?: string;
  updateAccounts?: (accounts: IAccount[]) => void;
  className?: string;
  allowUnassigned?: boolean;
}) => {
  return (
    <AccountsInlineProvider
      accountIds={accountIds}
      accounts={accounts}
      placeholder={placeholder}
      updateAccounts={updateAccounts}
      allowUnassigned={allowUnassigned}
    >
      <AccountsInlineTitle className={className} />
    </AccountsInlineProvider>
  );
};

export const AccountsInline = Object.assign(AccountsInlineRoot, {
  Provider: AccountsInlineProvider,
  Title: AccountsInlineTitle,
});
