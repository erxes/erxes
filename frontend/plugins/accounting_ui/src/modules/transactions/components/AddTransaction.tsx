import {
  Command,
  Popover,
  usePreviousHotkeyScope,
  useScopedHotkeys,
} from 'erxes-ui';
import { IAccount, JournalEnum } from '@/settings/account/types/Account';
import {
  TR_JOURNAL_GROUPS,
  TrJournalEnum,
  TrJournalGroup,
} from '@/transactions/types/constants';

import { AccountingHotkeyScope } from '@/types/AccountingHotkeyScope';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { SelectAccount } from '@/settings/account/components/SelectAccount';
import { getSingleJournalByAccount } from '@/transactions/transaction-form/components/utils';
import {
  buildTransactionCreatePath,
  getCurrentTransactionReturnPath,
} from '@/transactions/utils/transactionNavigation';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export type AddTransactionHandler = (
  journal?: TrJournalEnum,
  account?: IAccount,
) => void;

const useCreatePath = () => {
  const location = useLocation();

  return (journal: TrJournalEnum) =>
    buildTransactionCreatePath({
      defaultJournal: journal,
      returnTo: getCurrentTransactionReturnPath(location),
    });
};

export const AddTransaction = ({
  inForm,
  disableHotkey,
  children,
  onClick,
}: {
  inForm?: boolean;
  disableHotkey?: boolean;
  children: React.ReactNode;
  onClick?: AddTransactionHandler;
}) => {
  const { t } = useTranslation('accounting');
  const navigate = useNavigate();
  const getCreatePath = useCreatePath();
  const [open, setOpen] = useState(false);
  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      setHotkeyScopeAndMemorizePreviousScope(
        AccountingHotkeyScope.AddTransactionDropdown,
      );
    } else {
      goBackToPreviousHotkeyScope();
    }
  };

  useScopedHotkeys(
    'c',
    () => {
      if (!disableHotkey) {
        handleOpenChange(true);
      }
    },
    AccountingHotkeyScope.MainPage,
  );

  const handleSelect = (journal: TrJournalEnum) => {
    handleOpenChange(false);
    if (inForm) {
      onClick?.(journal);
      return;
    }
    navigate(getCreatePath(journal));
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <Popover.Trigger asChild>{children}</Popover.Trigger>
      <Popover.Content
        align="end"
        collisionPadding={8}
        className="flex w-[min(640px,calc(100vw-1rem))] max-h-(--radix-popover-content-available-height) flex-col overflow-hidden p-0"
      >
        <h4 className="px-3 pt-3 pb-1 text-sm font-semibold">
          {t('add-transaction-label')}
        </h4>
        {inForm && (
          <div className="flex flex-col gap-1.5 px-3 py-2">
            <span className="text-xs font-medium text-muted-foreground">
              {t('account')}
            </span>
            <SelectAccount
              placeholder={t('search-by-account')}
              defaultFilter={{
                journals: [
                  JournalEnum.MAIN,
                  JournalEnum.CASH,
                  JournalEnum.BANK,
                  JournalEnum.DEBT,
                ],
              }}
              onCallback={(account) => {
                onClick?.(
                  getSingleJournalByAccount(account.journal, account.kind),
                  account,
                );
                handleOpenChange(false);
              }}
            />
          </div>
        )}
        <Command className="min-h-0 flex-1">
          <Command.Input
            focusOnMount
            variant="primary"
            placeholder={t('search-type')}
          />
          <Command.List className="min-h-0 max-h-none flex-1 sm:**:[[cmdk-list-sizer]]:columns-2 md:**:[[cmdk-list-sizer]]:columns-3 **:[[cmdk-list-sizer]]:gap-x-2">
            <Command.Empty>{t('no-results-found')}</Command.Empty>
            {TR_JOURNAL_GROUPS.map((group) => (
              <AddTransactionGroup
                key={group.label}
                group={group}
                inForm={inForm}
                onSelect={handleSelect}
                onNavigate={() => handleOpenChange(false)}
              />
            ))}
          </Command.List>
        </Command>
      </Popover.Content>
    </Popover>
  );
};

const AddTransactionGroup = ({
  group,
  inForm,
  onSelect,
  onNavigate,
}: {
  group: TrJournalGroup;
  inForm?: boolean;
  onSelect: (journal: TrJournalEnum) => void;
  onNavigate: () => void;
}) => {
  const { t } = useTranslation('accounting');
  const groupLabel = t(group.label);

  return (
    <Command.Group
      className="break-inside-avoid"
      heading={
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <group.icon className="size-3.5" />
          {groupLabel}
        </span>
      }
    >
      {group.items
        .filter((item) => !item.hideInAdd && !(inForm && item.hideInForm))
        .map((item) => (
          <AddTransactionItem
            key={item.journal}
            value={`${groupLabel} ${t(item.label)} ${item.journal}`}
            journal={item.journal}
            inForm={inForm}
            onSelect={onSelect}
            onNavigate={onNavigate}
          >
            {t(item.label)}
          </AddTransactionItem>
        ))}
    </Command.Group>
  );
};

const AddTransactionItem = ({
  children,
  value,
  journal,
  inForm,
  onSelect,
  onNavigate,
}: {
  children: React.ReactNode;
  value: string;
  journal: TrJournalEnum;
  inForm?: boolean;
  onSelect: (journal: TrJournalEnum) => void;
  onNavigate: () => void;
}) => {
  const getCreatePath = useCreatePath();

  if (inForm) {
    return (
      <Command.Item
        value={value}
        className="cursor-pointer pl-7"
        onSelect={() => onSelect(journal)}
      >
        {children}
      </Command.Item>
    );
  }

  return (
    <Command.Item
      value={value}
      className="cursor-pointer p-0"
      onSelect={() => onSelect(journal)}
    >
      <Link
        to={getCreatePath(journal)}
        className="flex size-full items-center pr-2 pl-7"
        onClick={(event) => {
          event.stopPropagation();
          onNavigate();
        }}
      >
        {children}
      </Link>
    </Command.Item>
  );
};
