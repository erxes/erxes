import {
  SelectAccountContext,
  useSelectAccountContext,
} from '../contexts/SelectAccountContext';
import { IAccount } from '../types/Account';
import { useAccounts } from '../hooks/useAccounts';
import { useDebounce } from 'use-debounce';
import React, { useState } from 'react';
import {
  cn,
  Combobox,
  Command,
  Filter,
  Form,
  Popover,
  PopoverScoped,
  useFilterContext,
  useQueryState,
  RecordTableInlineCell,
} from 'erxes-ui';
import { AccountsInline } from './AccountsInline';
import { IconShoppingCart } from '@tabler/icons-react';

interface SelectAccountProviderProps {
  children: React.ReactNode;
  value?: string[] | string;
  onValueChange?: (value: string[] | string) => void;
  mode?: 'single' | 'multiple';
  defaultFilter?: { [key: string]: string | boolean | string[] };
  onCallback?: (account: IAccount) => void;
}

const SelectAccountProvider = ({
  children,
  value,
  onValueChange,
  mode = 'single',
  defaultFilter,
  onCallback,
}: SelectAccountProviderProps) => {
  const [accounts, setAccounts] = useState<IAccount[]>([]);
  const accountIds = Array.isArray(value) ? value : value && [value] || [];

  const onSelect = (account?: IAccount) => {
    if (!account) return;
    if (onCallback) {
      onCallback(account);
    }
    if (mode === 'single') {
      setAccounts([account]);
      onValueChange?.(account._id);
      return;
    }

    const arrayValue = Array.isArray(value) ? value : [];
    const isAccountSelected = arrayValue.includes(account._id);
    const newSelectedAccountIds = isAccountSelected
      ? arrayValue.filter((id) => id !== account._id)
      : [...arrayValue, account._id];

    setAccounts((prevAccounts) => {
      const accountMap = new Map(prevAccounts.map((p) => [p._id, p]));
      accountMap.set(account._id, account);
      return newSelectedAccountIds
        .map((id) => accountMap.get(id))
        .filter((p): p is IAccount => p !== undefined);
    });
    onValueChange?.(newSelectedAccountIds);
  };
  return (
    <SelectAccountContext.Provider
      value={{
        accountIds,
        onSelect,
        accounts,
        setAccounts,
        defaultFilter,
      }}
    >
      {children}
    </SelectAccountContext.Provider>
  );
};

const SelectAccountContent = () => {
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 500);
  const { accountIds, accounts, defaultFilter } = useSelectAccountContext();
  const {
    accounts: accountsData,
    loading,
    handleFetchMore,
    totalCount,
    error,
  } = useAccounts({
    variables: {
      ...defaultFilter,
      searchValue: debouncedSearch,
    },
  });
  return (
    <Command shouldFilter={false}>
      <Command.Input
        value={search}
        onValueChange={setSearch}
        variant="secondary"
        wrapperClassName="flex-auto"
        focusOnMount
      />
      <Command.List className="max-h-[300px] overflow-y-auto">
        {accounts?.length > 0 && (
          <>
            {accounts.map((account) => (
              <SelectAccountCommandItem key={account._id} account={account} />
            ))}
            <Command.Separator className="my-1" />
          </>
        )}
        <Combobox.Empty loading={loading} error={error} />
        {!loading &&
          accountsData
            ?.filter(
              (account) => !accountIds.includes(account._id)
            )
            .map((account) => (
              <SelectAccountCommandItem key={account._id} account={account} />
            ))}

        {!loading && (
          <Combobox.FetchMore
            fetchMore={handleFetchMore}
            currentLength={accountsData?.length || 0}
            totalCount={totalCount}
          />
        )}
      </Command.List>
    </Command>
  );
};

const SelectAccountCommandItem = ({ account }: { account: IAccount }) => {
  const { onSelect, accountIds } = useSelectAccountContext();
  return (
    <Command.Item
      value={account._id}
      onSelect={() => {
        onSelect(account);
      }}
    >
      <AccountsInline accounts={[account]} placeholder="Unnamed account" />
      <Combobox.Check checked={accountIds.includes(account._id)} />
    </Command.Item>
  );
};

const SelectAccountInlineCell = ({
  onValueChange,
  scope,
  ...props
}: Omit<React.ComponentProps<typeof SelectAccountProvider>, 'children'> & {
  scope?: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectAccountProvider
      onValueChange={(value) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      {...props}
    >
      <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
        <RecordTableInlineCell.Trigger>
          <SelectAccountValue />
        </RecordTableInlineCell.Trigger>
        <RecordTableInlineCell.Content>
          <SelectAccountContent />
        </RecordTableInlineCell.Content>
      </PopoverScoped>
    </SelectAccountProvider>
  );
};

const SelectAccountRoot = React.forwardRef<
  React.ElementRef<typeof Combobox.Trigger>,
  Omit<React.ComponentProps<typeof SelectAccountProvider>, 'children'> &
  React.ComponentProps<typeof Combobox.Trigger> & {
    placeholder?: string;
    scope?: string;
  }
>(
  (
    { onValueChange, className, mode, value, placeholder, scope, defaultFilter, onCallback, ...props },
    ref,
  ) => {
    const [open, setOpen] = useState(false);

    return (
      <SelectAccountProvider
        mode={mode}
        value={value}
        onValueChange={(value) => {
          if (mode === 'single') {
            setOpen(false);
          }
          onValueChange?.(value);
        }}
        defaultFilter={defaultFilter}
        onCallback={onCallback}
      >
        <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
          <Combobox.Trigger
            className={cn('w-full inline-flex', className)}
            variant="outline"
            ref={ref}
            {...props}
          >
            <SelectAccountValue />
          </Combobox.Trigger>
          <Combobox.Content>
            <SelectAccountContent />
          </Combobox.Content>
        </PopoverScoped>
      </SelectAccountProvider>
    );
  },
);

const SelectAccountValue = ({ placeholder }: { placeholder?: string }) => {
  const { accountIds, accounts, setAccounts } = useSelectAccountContext();

  return (
    <AccountsInline
      accountIds={accountIds}
      accounts={accounts}
      updateAccounts={setAccounts}
      placeholder={placeholder}
    />
  );
};

export const SelectAccountFilterItem = () => {
  return (
    <Filter.Item value="account">
      <IconShoppingCart />
      Account
    </Filter.Item>
  );
};

export const SelectAccountFilterView = ({
  onValueChange,
  queryKey,
  mode = 'single',
  onCallback
}: {
  onValueChange?: (value: string[] | string) => void;
  queryKey?: string;
  mode?: 'single' | 'multiple';
  onCallback?: (account: IAccount) => void;
}) => {
  const [account, setAccount] = useQueryState<string[] | string>(
    queryKey || 'account',
  );
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey={queryKey || 'account'}>
      <SelectAccountProvider
        mode={mode}
        value={account || (mode === 'single' ? '' : [])}
        onValueChange={(value) => {
          setAccount(value);
          resetFilterState();
          onValueChange?.(value);
        }}
        onCallback={onCallback}
      >
        <SelectAccountContent />
      </SelectAccountProvider>
    </Filter.View>
  );
};

export const SelectAccountFilterBar = ({
  iconOnly,
  onValueChange,
  queryKey,
  mode = 'single',
  onCallback,
}: {
  iconOnly?: boolean;
  onValueChange?: (value: string[] | string) => void;
  queryKey?: string;
  mode?: 'single' | 'multiple';
  onCallback?: (account: IAccount) => void;
}) => {
  const [account, setAccount] = useQueryState<string[] | string>(
    queryKey || 'account',
  );
  const [open, setOpen] = useState(false);

  if (!account) {
    return null;
  }

  return (
    <Filter.BarItem queryKey={queryKey || 'account'}>
      <Filter.BarName>
        <IconShoppingCart />
        {!iconOnly && 'Accounts'}
      </Filter.BarName>
      <SelectAccountProvider
        mode={mode}
        value={account || (mode === 'single' ? '' : [])}
        onValueChange={(value) => {
          if (value.length > 0) {
            setAccount(value);
          } else {
            setAccount(null);
          }
          setOpen(false);
          onValueChange?.(value);
        }}
        onCallback={onCallback}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Filter.BarButton filterKey={queryKey || 'account'}>
              <SelectAccountValue />
            </Filter.BarButton>
          </Popover.Trigger>
          <Combobox.Content>
            <SelectAccountContent />
          </Combobox.Content>
        </Popover>
      </SelectAccountProvider>
    </Filter.BarItem>
  );
};

export const SelectAccountFormItem = ({
  onValueChange,
  className,
  placeholder,
  ...props
}: Omit<React.ComponentProps<typeof SelectAccountProvider>, 'children'> & {
  className?: string;
  placeholder?: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectAccountProvider
      onValueChange={(value) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Form.Control>
          <Combobox.Trigger className={cn('w-full shadow-xs', className)}>
            <SelectAccountValue placeholder={placeholder} />
          </Combobox.Trigger>
        </Form.Control>
        <Combobox.Content>
          <SelectAccountContent />
        </Combobox.Content>
      </Popover>
    </SelectAccountProvider>
  );
};

export const SelectAccount = Object.assign(SelectAccountRoot, {
  Provider: SelectAccountProvider,
  Content: SelectAccountContent,
  Item: SelectAccountCommandItem,
  InlineCell: SelectAccountInlineCell,
  Value: SelectAccountValue,
  FilterItem: SelectAccountFilterItem,
  FilterView: SelectAccountFilterView,
  FilterBar: SelectAccountFilterBar,
  FormItem: SelectAccountFormItem,
});
