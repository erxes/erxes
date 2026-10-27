import {
  DropdownMenu,
  usePreviousHotkeyScope,
  useScopedHotkeys,
} from 'erxes-ui';
import { IAccount, JournalEnum } from '@/settings/account/types/Account';
import {
  TR_JOURNAL_GROUPS,
  TrJournalEnum,
} from '@/transactions/types/constants';

import { AccountingHotkeyScope } from '@/types/AccountingHotkeyScope';
import { Link } from 'react-router-dom';
import { SelectAccount } from '@/settings/account/components/SelectAccount';
import { getSingleJournalByAccount } from '@/transactions/transaction-form/components/utils';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export type AddTransactionHandler = (
  journal?: TrJournalEnum,
  account?: IAccount,
) => void;

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
  const [open, setOpen] = useState(false);
  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();

  useScopedHotkeys(
    'c',
    () => {
      if (!disableHotkey) {
        setOpen(true);
      }
    },
    AccountingHotkeyScope.MainPage,
  );

  return (
    <DropdownMenu
      open={open}
      onOpenChange={(op) => {
        setOpen(op);
        if (op) {
          setHotkeyScopeAndMemorizePreviousScope(
            AccountingHotkeyScope.AddTransactionDropdown,
          );
        } else {
          goBackToPreviousHotkeyScope();
        }
      }}
    >
      <DropdownMenu.Trigger asChild>{children}</DropdownMenu.Trigger>
      <DropdownMenu.Content
        align="end"
        collisionPadding={8}
        className="min-w-(--radix-dropdown-menu-trigger-width) max-h-(--radix-dropdown-menu-content-available-height) overflow-y-auto"
      >
        {inForm && (
          <>
            <DropdownMenu.Label>{t('account')}</DropdownMenu.Label>
            <div className="px-2 pb-2">
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
                  setOpen(false);
                }}
              />
            </div>
            <DropdownMenu.Separator />
          </>
        )}
        {TR_JOURNAL_GROUPS.map((group) => (
          <DropdownMenu.Group key={group.label} className="pb-1">
            <DropdownMenu.Label className="flex items-center gap-1.5 text-muted-foreground">
              <group.icon className="size-3.5" />
              {t(group.label)}
            </DropdownMenu.Label>
            {group.items
              .filter((item) => !item.hideInAdd && !(inForm && item.hideInForm))
              .map((item) => (
                <AddTransactionItem
                  key={item.journal}
                  journal={item.journal}
                  onClick={onClick}
                  inForm={inForm}
                >
                  {t(item.label)}
                </AddTransactionItem>
              ))}
          </DropdownMenu.Group>
        ))}
        <DropdownMenu.Item disabled className="pl-7">
          {t('adjustment')}
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};

const AddTransactionItem = ({
  children,
  journal,
  inForm,
  onClick,
}: {
  children: React.ReactNode;
  journal: TrJournalEnum;
  onClick?: AddTransactionHandler;
  inForm?: boolean;
}) => {
  const className = 'cursor-pointer pl-7';

  if (!inForm) {
    return (
      <DropdownMenu.Item asChild className={className}>
        <Link to={`/accounting/transaction/create?defaultJournal=${journal}`}>
          {children}
        </Link>
      </DropdownMenu.Item>
    );
  }
  return (
    <DropdownMenu.Item className={className} onClick={() => onClick?.(journal)}>
      {children}
    </DropdownMenu.Item>
  );
};
