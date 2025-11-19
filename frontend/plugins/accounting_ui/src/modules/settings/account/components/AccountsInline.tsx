import {
  Combobox,
  Tooltip,
  isUndefinedOrNull,
} from 'erxes-ui';
import { useEffect, useMemo, useState } from 'react';
import {
  AccountsInlineContext,
  useAccountsInlineContext,
} from '../contexts/AccountsInlineContext';
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
  const [accountsList, setAccountsList] = useState<IAccount[]>(accounts || []);

  const contextValue = useMemo(
    () => ({
      accounts: accounts || accountsList,
      loading: false,
      accountIds: accountIds || [],
      placeholder: isUndefinedOrNull(placeholder)
        ? 'Select Accounts'
        : placeholder,
      updateAccounts: updateAccounts || setAccountsList,
      allowUnassigned,
    }),
    [
      accounts,
      accountsList,
      accountIds,
      placeholder,
      updateAccounts,
      allowUnassigned,
    ],
  );

  const missingAccountIds =
    accountIds?.filter((id) => !accounts?.some((a) => a._id === id)) || [];

  return (
    <AccountsInlineContext.Provider value={contextValue}>
      <Tooltip.Provider>{children}</Tooltip.Provider>

      {missingAccountIds.length > 0 && (
        <AccountsInlineEffectComponent missingAccountIds={missingAccountIds} />
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
    if (!missingAccounts?.length) return;

    const existingAccountsMap = new Map(
      accounts.map((acc) => [acc._id, acc])
    );
    const newAccounts = missingAccounts.filter(
      (acc) => !existingAccountsMap.has(acc._id),
    );

    if (newAccounts.length > 0) {
      updateAccounts?.([...accounts, ...newAccounts]);
    }
  }, [missingAccounts, missingAccountIds, accounts, updateAccounts]);

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
