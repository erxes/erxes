import { AccountingHotkeyScope } from '@/types/AccountingHotkeyScope';
import {
  DropdownMenu,
  usePreviousHotkeyScope,
  useScopedHotkeys,
} from 'erxes-ui';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { TrJournalEnum } from '../types/constants';

export const AddTransaction = ({
  inForm,
  children,
  onClick,
}: {
  inForm?: boolean;
  children: React.ReactNode;
  onClick?: (journal?: TrJournalEnum) => void;
}) => {
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
      <DropdownMenu.Content className="min-w-[--radix-dropdown-menu-trigger-width]">
        <DropdownMenu.Label>Ерөнхий</DropdownMenu.Label>
        <AddTransactionItem
          journal={TrJournalEnum.MAIN}
          onClick={onClick}
          inForm={inForm}
        >
          Ерөнхий журнал
        </AddTransactionItem>
        <AddTransactionItem disabled>НӨАТ</AddTransactionItem>
        <DropdownMenu.Label>Мөнгөн хөрөнгө</DropdownMenu.Label>
        <AddTransactionItem
          journal={TrJournalEnum.CASH}
          onClick={onClick}
          inForm={inForm}
        >
          Касс
        </AddTransactionItem>
        <AddTransactionItem
          journal={TrJournalEnum.BANK}
          onClick={onClick}
          inForm={inForm}
        >
          Харилцах
        </AddTransactionItem>
        <DropdownMenu.Label>Тооцоо</DropdownMenu.Label>
        <AddTransactionItem
          journal={TrJournalEnum.RECEIVABLE}
          onClick={onClick}
          inForm={inForm}
        >
          Авлага
        </AddTransactionItem>
        <AddTransactionItem
          journal={TrJournalEnum.PAYABLE}
          onClick={onClick}
          inForm={inForm}
        >
          Өглөг
        </AddTransactionItem>

        <DropdownMenu.Label>Бараа материал</DropdownMenu.Label>
        <AddTransactionItem
          journal={TrJournalEnum.INV_INCOME}
          onClick={onClick}
          inForm={inForm}
        >
          Орлого
        </AddTransactionItem>
        <AddTransactionItem
          journal={TrJournalEnum.INV_OUT}
          onClick={onClick}
          inForm={inForm}
        >
          Хангамжийн зарлага
        </AddTransactionItem>
        {
          !inForm && (
            <AddTransactionItem
              journal={TrJournalEnum.INV_MOVE}
              onClick={onClick}
              inForm={inForm}
            >
              Дотоод хөдөлгөөн
            </AddTransactionItem>
          )
        }
        <AddTransactionItem
          journal={TrJournalEnum.INV_SALE}
          onClick={onClick}
          inForm={inForm}
        >
          Борлуулалт
        </AddTransactionItem>
        <AddTransactionItem disabled>
          Борлуулалт (ажил үйлчилгээ)
        </AddTransactionItem>
        <DropdownMenu.Label>Үндсэн хөрөнгө</DropdownMenu.Label>
        <AddTransactionItem disabled>Орлого</AddTransactionItem>
        <AddTransactionItem disabled>Акт</AddTransactionItem>
        <AddTransactionItem disabled>Хөдөлгөөн</AddTransactionItem>
        <AddTransactionItem disabled>Тохируулга</AddTransactionItem>
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
  onClick?: (journal?: TrJournalEnum) => void;
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
    <DropdownMenu.Item onClick={() => onClick && onClick(journal)}>
      {children}
    </DropdownMenu.Item>
  );
};
