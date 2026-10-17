import { useTranslation } from 'react-i18next';
import { AccountingHotkeyScope } from '@/types/AccountingHotkeyScope';
import { SelectAccount } from '@/settings/account/components/SelectAccount';
import { IAccount, JournalEnum } from '@/settings/account/types/Account';
import {
  IconBook,
  IconBuildingBank,
  IconBuildingFactory2,
  IconCalculator,
  IconPackage,
} from '@tabler/icons-react';
import type { Icon } from '@tabler/icons-react';
import {
  DropdownMenu,
  usePreviousHotkeyScope,
  useScopedHotkeys,
} from 'erxes-ui';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { TrJournalEnum } from '../types/constants';
import { getSingleJournalByAccount } from '../transaction-form/components/utils';

export type AddTransactionHandler = (
  journal?: TrJournalEnum,
  account?: IAccount,
) => void;

type AddTransactionGroup = {
  label: string;
  icon: Icon;
  items: { journal: TrJournalEnum; label: string; hideInForm?: boolean }[];
};

const ADD_TRANSACTION_GROUPS: AddTransactionGroup[] = [
  {
    label: 'general',
    icon: IconBook,
    items: [{ journal: TrJournalEnum.MAIN, label: 'general-journal' }],
  },
  {
    label: 'cash-and-bank',
    icon: IconBuildingBank,
    items: [
      { journal: TrJournalEnum.CASH, label: 'cash-label' },
      { journal: TrJournalEnum.BANK, label: 'bank' },
    ],
  },
  {
    label: 'calculation',
    icon: IconCalculator,
    items: [
      { journal: TrJournalEnum.RECEIVABLE, label: 'accounts-receivable' },
      { journal: TrJournalEnum.PAYABLE, label: 'accounts-payable' },
    ],
  },
  {
    label: 'inventory-label',
    icon: IconPackage,
    items: [
      { journal: TrJournalEnum.INV_INCOME, label: 'receipt' },
      { journal: TrJournalEnum.INV_OUT, label: 'supplies-issue' },
      { journal: TrJournalEnum.INV_JUSTIFY, label: 'cost-adjustment' },
      {
        journal: TrJournalEnum.INV_MOVE,
        label: 'internal-transfer',
        hideInForm: true,
      },
      { journal: TrJournalEnum.INV_SALE, label: 'sale' },
      { journal: TrJournalEnum.INV_SALE_RETURN, label: 'sales-return' },
    ],
  },
  {
    label: 'fixed-asset',
    icon: IconBuildingFactory2,
    items: [
      { journal: TrJournalEnum.FXA_INCOME, label: 'receipt' },
      { journal: TrJournalEnum.FXA_OUT, label: 'disposal' },
      { journal: TrJournalEnum.FXA_MOVE, label: 'movement' },
      { journal: TrJournalEnum.FXA_SALE, label: 'sale' },
    ],
  },
];

export const AddTransaction = ({
  inForm,
  children,
  onClick,
}: {
  inForm?: boolean;
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
      setOpen(true);
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
        {ADD_TRANSACTION_GROUPS.map((group) => (
          <DropdownMenu.Group key={group.label} className="pb-1">
            <DropdownMenu.Label className="flex items-center gap-1.5 text-muted-foreground">
              <group.icon className="size-3.5" />
              {t(group.label)}
            </DropdownMenu.Label>
            {group.items
              .filter((item) => !(inForm && item.hideInForm))
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
