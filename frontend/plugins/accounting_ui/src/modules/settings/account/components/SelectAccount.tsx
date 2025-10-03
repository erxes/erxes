import {
  Combobox,
  Command,
  Form,
  PopoverScoped,
  Skeleton,
  TextOverflowTooltip,
  usePreviousHotkeyScope,
} from 'erxes-ui';
import { useState } from 'react';
import { useAccounts } from '../hooks/useAccounts';
import { IAccount } from '../types/Account';

import React from 'react';
import { useDebounce } from 'use-debounce';

export const SelectAccount = React.forwardRef<
  React.ElementRef<typeof Combobox.Trigger>,
  React.ComponentProps<typeof Combobox.Trigger> & {
    value?: string;
    onValueChange: (value: string) => void;
    onCallback?: (account: IAccount) => void;
    defaultFilter: { [key: string]: string | boolean | string[] };
    inForm?: boolean;
    scope?: string;
  }
>(
  (
    {
      value,
      onValueChange,
      onCallback,
      defaultFilter,
      inForm,
      scope,
      className,
      ...props
    },
    ref,
  ) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [debouncedSearch] = useDebounce(search, 200);
    const { accounts, loading, error, totalCount, handleFetchMore } =
      useAccounts({
        variables: {
          ...defaultFilter,
          searchValue: debouncedSearch,
        },
        skip: !value && !open,
      });

    const Controller = inForm ? Form.Control : React.Fragment;

    const { goBackToPreviousHotkeyScope } = usePreviousHotkeyScope();

    return (
      <PopoverScoped
        open={open}
        onOpenChange={setOpen}
        scope={scope ? scope + '-select-account' : undefined}
      >
        <Controller>
          <Combobox.Trigger
            ref={ref}
            {...props}
          >
            {loading ? (
              <Skeleton className="w-full h-4" />
            ) : (
              <Combobox.Value
                placeholder="Select account"
                value={
                  accounts?.find((account: IAccount) => account._id === value)
                    ?.name
                }
              />
            )}
          </Combobox.Trigger>
        </Controller>
        <Combobox.Content>
          <Command shouldFilter={false}>
            <Command.Input
              placeholder="Search account"
              value={search}
              onValueChange={(v) => setSearch(v)}
            />
            <Command.List>
              <Combobox.Empty loading={loading} error={error} />
              {accounts?.map((account: IAccount) => (
                <Command.Item
                  key={account._id}
                  value={account._id}
                  onSelect={() => {
                    onValueChange(account._id);
                    onCallback && onCallback(account);
                    setOpen(false);
                    goBackToPreviousHotkeyScope();
                  }}
                >
                  <TextOverflowTooltip
                    value={`${account.code} - ${account.name}`}
                  />
                  <Combobox.Check checked={account._id === value} />
                </Command.Item>
              ))}

              <Combobox.FetchMore
                totalCount={totalCount}
                currentLength={accounts?.length ?? 0}
                fetchMore={handleFetchMore}
              />
            </Command.List>
          </Command>
        </Combobox.Content>
      </PopoverScoped>
    );
  },
);

SelectAccount.displayName = 'SelectAccount';
