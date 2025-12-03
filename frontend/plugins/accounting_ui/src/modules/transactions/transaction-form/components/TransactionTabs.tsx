import { IconX, IconZoomExclamation } from '@tabler/icons-react';
import { Button, cn, Tabs, Tooltip } from 'erxes-ui';
import { useAtom, useAtomValue } from 'jotai';
import React, { useEffect } from 'react';
import { useFieldArray } from 'react-hook-form';
import { AddTransaction } from '../../components/AddTransaction';
import { TR_JOURNAL_LABELS, TR_PERFECT_JOURNALS, TR_SIDES, TrJournalEnum } from '../../types/constants';
import { JOURNALS_BY_JOURNAL } from '../contants/defaultValues';
import { activeJournalState, followTrDocsState, isPerfectState } from '../states/trStates';
import {
  ITransactionGroupForm,
  TTrDoc,
} from '../types/JournalForms';
import { BankTransaction } from './forms/BankForm';
import { CashTransaction } from './forms/CashForm';
import { InvIncomeForm } from './forms/InvIncomeForm';
import { InvMoveForm } from './forms/InvMoveForm';
import { InvOutForm } from './forms/InvOutForm';
import { InvSaleForm } from './forms/InvSaleForm';
import { MainJournalForm } from './forms/MainJournalForm';
import { PayableTransaction } from './forms/PayableForm';
import { ReceivableTransaction } from './forms/ReceivableForm';
import { sumDtAndCt } from './Summary';
import { TBalance } from './TBalance';

// Separate the transaction form component to prevent unnecessary re-renders
const TransactionForm = ({
  form,
  field,
  index,
}: {
  form: ITransactionGroupForm;
  field: any;
  index: number;
}) => {
  if (field.journal === TrJournalEnum.MAIN)
    return <MainJournalForm form={form} index={index} />;
  if (field.journal === TrJournalEnum.CASH)
    return <CashTransaction form={form} index={index} />;
  if (field.journal === TrJournalEnum.BANK)
    return <BankTransaction form={form} index={index} />;
  if (field.journal === TrJournalEnum.RECEIVABLE)
    return <ReceivableTransaction form={form} index={index} />;
  if (field.journal === TrJournalEnum.PAYABLE)
    return <PayableTransaction form={form} index={index} />;
  if (field.journal === TrJournalEnum.INV_INCOME)
    return <InvIncomeForm form={form} index={index} />;
  if (field.journal === TrJournalEnum.INV_OUT)
    return <InvOutForm form={form} index={index} />;
  if (field.journal === TrJournalEnum.INV_MOVE)
    return <InvMoveForm form={form} index={index} />;
  if (field.journal === TrJournalEnum.INV_SALE)
    return <InvSaleForm form={form} index={index} />;
  return null;
};

const ErrorTip = ({ index, errors }: { index: number, errors?: any }) => {
  if (!errors?.trDocs?.length || !errors.trDocs[index]) {
    return null;
  }

  const errs = errors.trDocs[index];

  // Recursive renderer
  const renderErrors = (obj: any, parentKey = ""): JSX.Element[] => {
    const items: JSX.Element[] = [];

    for (const key in obj) {
      const val = obj[key];
      const fullKey = parentKey ? `${parentKey}.${key}` : key;

      if (Array.isArray(val)) {
        val.forEach((item, idx) => {
          items.push(
            <React.Fragment key={`${fullKey}[${idx}]`}>
              {renderErrors(item, `${fullKey}[${idx}]`)}
            </React.Fragment>
          );
        });
      } else if (typeof val === "object" && val !== null) {
        if (val.message) {
          items.push(
            <li key={fullKey}>
              <span className="font-medium text-red-400">{fullKey}</span>: {val.message}
            </li>
          );
        } else {
          items.push(
            <React.Fragment key={fullKey}>
              {renderErrors(val, fullKey)}
            </React.Fragment>
          );
        }
      }
    }
    return items;
  };

  return (
    <Tooltip>
      <Tooltip.Trigger tabIndex={-1}>
        <IconZoomExclamation className="size-4 text-red-400 cursor-pointer" />
      </Tooltip.Trigger>
      <Tooltip.Content
        side="bottom"
        className="max-w-[300px] bg-white text-red-400 border border-red-50 rounded-md shadow-md p-2"
      >
        <ul className="text-sm space-y-1 list-disc pl-4">
          {renderErrors(errs)}
        </ul>
      </Tooltip.Content>
    </Tooltip>
  );
}

export const TransactionsTabsList = ({
  form,
}: {
  form: ITransactionGroupForm;
}) => {
  const [activeJournal, setActiveJournal] = useAtom(activeJournalState);
  const [isPerfect, setIsPerfect] = useAtom(isPerfectState);

  // Use useFieldArray with keyName for better performance
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'trDocs',
    keyName: 'fieldId',
    rules: {
      minLength: 1,
    },
  });

  const journals = fields.map(f => f.journal);

  useEffect(() => {
    const foundPJournals = journals.filter(j => TR_PERFECT_JOURNALS.includes(j));

    if (foundPJournals.length) {
      setIsPerfect(true)
    } else {
      setIsPerfect(false)
    }


  }, [journals]);

  const followTrDocs = useAtomValue(followTrDocsState);

  const handleRemove = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    remove(index);
    index.toString() === activeJournal && setActiveJournal('0');
  };

  const handleAddTransaction = (journal?: TrJournalEnum) => {
    const selectedJournal = journal || TrJournalEnum.MAIN;

    const [sumDebit, sumCredit] = sumDtAndCt(fields as TTrDoc[], followTrDocs);
    const diff = sumDebit - sumCredit;
    const likeTrDoc = fields[0];

    const fakeTrDoc = {
      ptrId: likeTrDoc.ptrId,
      parentId: likeTrDoc.parentId,
      branchId: likeTrDoc.branchId,
      description: likeTrDoc.description,
      customerType: likeTrDoc.customerType,
      customerId: likeTrDoc.customerId,
      departmentId: likeTrDoc.departmentId,
      journal: selectedJournal,
      details: [{
        ...fields[0].details,
        side: diff > 0 ? TR_SIDES.CREDIT : TR_SIDES.DEBIT,
        amount: Math.abs(diff)
      }]
    };

    const newJournal = JOURNALS_BY_JOURNAL(selectedJournal, fakeTrDoc as any) as TTrDoc;
    append(newJournal);
    setActiveJournal(fields.length.toString());
  };

  return (
    <Tabs
      className="col-span-2"
      value={activeJournal}
      onValueChange={setActiveJournal}
    >
      <div className="flex items-center gap-3">
        <Tabs.List className="w-full justify-start flex-auto">
          {fields.map((field, index) => (
            <Tabs.Trigger
              key={field.fieldId}
              value={index.toString()}
              className={cn(index.toString() === activeJournal && "font-bold", "capitalize py-1 gap-2 pr-1 h-8")}
              asChild
            >
              <div>
                {TR_JOURNAL_LABELS[field.journal]}
                <ErrorTip errors={form.formState.errors} index={index} />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => handleRemove(index, e)}
                  disabled={fields.length === 1}
                >
                  <IconX />
                </Button>
              </div>
            </Tabs.Trigger>
          ))}
          <Tabs.Trigger
            key={'tBalance'}
            value={'tBalance'}
            className={cn('tBalance' === activeJournal && "font-bold", "capitalize py-1 gap-2 pr-1 h-8")}
            asChild
          >
            <div>{'T Balance'}</div>
          </Tabs.Trigger>

          {!isPerfect && (
            <div className='inline-flex items-center justify-center rounded-sm px-3 text-sm font-medium hover:bg-accent capitalize py-1 gap-2 pr-1 h-8'>
              <AddTransaction inForm onClick={handleAddTransaction}>
                <div>
                  {'+ New Transaction'}
                </div>
              </AddTransaction>
            </div>
          )}
        </Tabs.List>

        <Button variant="secondary">Save transaction template</Button>
      </div>
      {fields.map((field, index) => (
        <Tabs.Content
          key={field.fieldId}
          value={index.toString()}
          className="mt-6"
        >
          <TransactionForm form={form} field={field} index={index} />
        </Tabs.Content>
      ))}
      <Tabs.Content
        key={'tBalance'}
        value={'tBalance'}
        className="mt-6"
      >
        <TBalance form={form} />
      </Tabs.Content>
    </Tabs>
  );
};
