import { useTranslation } from 'react-i18next';
import { AccountingHotkeyScope } from '@/types/AccountingHotkeyScope';
import { SelectAccount } from '@/settings/account/components/SelectAccount';
import { IAccount, JournalEnum } from '@/settings/account/types/Account';
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
      <DropdownMenu.Content className="min-w-(--radix-dropdown-menu-trigger-width)">
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
        <DropdownMenu.Label>{t('general')}</DropdownMenu.Label>
        <AddTransactionItem
          journal={TrJournalEnum.MAIN}
          onClick={onClick}
          inForm={inForm}
        >
          {t('general-journal')}
        </AddTransactionItem>
        <AddTransactionItem disabled>{t('vat')}</AddTransactionItem>
        <DropdownMenu.Label>{t('cash-and-bank')}</DropdownMenu.Label>
        <AddTransactionItem
          journal={TrJournalEnum.CASH}
          onClick={onClick}
          inForm={inForm}
        >
          {t('cash')}
        </AddTransactionItem>
        <AddTransactionItem
          journal={TrJournalEnum.BANK}
          onClick={onClick}
          inForm={inForm}
        >
          {t('bank')}
        </AddTransactionItem>
        <DropdownMenu.Label>{t('settlement')}</DropdownMenu.Label>
        <AddTransactionItem
          journal={TrJournalEnum.RECEIVABLE}
          onClick={onClick}
          inForm={inForm}
        >
          {t('receivables')}
        </AddTransactionItem>
        <AddTransactionItem
          journal={TrJournalEnum.PAYABLE}
          onClick={onClick}
          inForm={inForm}
        >
          {t('payables')}
        </AddTransactionItem>

        <DropdownMenu.Label>{t('inventory')}</DropdownMenu.Label>
        <AddTransactionItem
          journal={TrJournalEnum.INV_INCOME}
          onClick={onClick}
          inForm={inForm}
        >
          {t('receipts')}
        </AddTransactionItem>
        <AddTransactionItem
          journal={TrJournalEnum.INV_OUT}
          onClick={onClick}
          inForm={inForm}
        >
          {t('supplies-issued')}
        </AddTransactionItem>
        <AddTransactionItem
          journal={TrJournalEnum.INV_JUSTIFY}
          onClick={onClick}
          inForm={inForm}
        >
          {t('cost-adjustment')}
        </AddTransactionItem>
        {!inForm && (
          <AddTransactionItem
            journal={TrJournalEnum.INV_MOVE}
            onClick={onClick}
            inForm={inForm}
          >
            {t('internal-transfer')}
          </AddTransactionItem>
        )}
        <AddTransactionItem
          journal={TrJournalEnum.INV_SALE}
          onClick={onClick}
          inForm={inForm}
        >
          {t('sale')}
        </AddTransactionItem>
        <AddTransactionItem
          journal={TrJournalEnum.INV_SALE_RETURN}
          onClick={onClick}
          inForm={inForm}
        >
          {t('sales-return')}
        </AddTransactionItem>

        <DropdownMenu.Label>{t('fixed-asset')}</DropdownMenu.Label>
        <AddTransactionItem
          journal={TrJournalEnum.FXA_INCOME}
          onClick={onClick}
          inForm={inForm}
        >
          {t('receipts')}
        </AddTransactionItem>
        <AddTransactionItem
          journal={TrJournalEnum.FXA_OUT}
          onClick={onClick}
          inForm={inForm}
        >
          {t('write-off')}
        </AddTransactionItem>
        <AddTransactionItem
          journal={TrJournalEnum.FXA_MOVE}
          onClick={onClick}
          inForm={inForm}
        >
          {t('transfer')}
        </AddTransactionItem>
        <AddTransactionItem
          journal={TrJournalEnum.FXA_SALE}
          onClick={onClick}
          inForm={inForm}
        >
          {t('sale')}
        </AddTransactionItem>
        <AddTransactionItem disabled>{t('adjustment')}</AddTransactionItem>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};

const AddTransactionItem = ({
  children,
  disabled,
  journal,
  inForm,
  onClick,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  journal?: TrJournalEnum;
  onClick?: AddTransactionHandler;
  inForm?: boolean;
}) => {
  if (disabled) {
    return <DropdownMenu.Item disabled>{children}</DropdownMenu.Item>;
  }
  if (!inForm && journal) {
    return (
      <DropdownMenu.Item asChild>
        <Link to={`/accounting/transaction/create?defaultJournal=${journal}`}>
          {children}
        </Link>
      </DropdownMenu.Item>
    );
  }
  return (
    <DropdownMenu.Item onClick={() => onClick?.(journal)}>
      {children}
    </DropdownMenu.Item>
  );
};
