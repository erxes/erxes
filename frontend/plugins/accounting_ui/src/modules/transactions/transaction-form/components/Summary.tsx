import { followTrDocsState } from '../states/trStates';
import { IconGavel, IconTrashX } from '@tabler/icons-react';
import { ITransaction } from '@/transactions/types/Transaction';
import { ITransactionGroupForm, TTrDoc } from '../types/JournalForms';
import { TR_SIDES } from '../../types/constants';
import { useAtomValue } from 'jotai';
import { useTransactionsRemove } from '../hooks/useTransactionsRemove';
import { useWatch } from 'react-hook-form';
import {
  Button,
  CurrencyCode,
  CurrencyFormatedDisplay,
  useConfirm,
  useQueryState,
} from 'erxes-ui';

const getSum = (trDocs: any[], sumDebit: number, sumCredit: number) => {
  trDocs?.forEach((tr) => {
    if (!(tr?.details && tr?.details[0])) {
      return;
    }

    if (tr?.details[0]?.side === TR_SIDES.DEBIT) {
      sumDebit += tr?.details[0]?.amount ?? 0;
    } else {
      sumCredit += tr?.details[0]?.amount ?? 0;
    }
  });
  return [sumDebit, sumCredit];
};

export const sumDtAndCt = (trDocs: TTrDoc[], followTrDocs: ITransaction[]) => {
  const [sumDt, sumCt] = getSum(trDocs || [], 0, 0);
  const [sumDebit, sumCredit] = getSum(followTrDocs, sumDt, sumCt);
  return [sumDebit, sumCredit];
};

export const Summary = ({ form }: { form: ITransactionGroupForm }) => {
  const { trDocs } = useWatch({ control: form.control });
  const followTrDocs = useAtomValue(followTrDocsState);
  const [parentId] = useQueryState<string>('parentId');

  const { removeTransactions } = useTransactionsRemove();
  const { confirm } = useConfirm();

  const [sumDebit, sumCredit] = sumDtAndCt(trDocs as TTrDoc[], followTrDocs);

  const handleDelete = () =>
    confirm({
      message: 'Are you sure you want to delete these transactions?',
      options: {
        okLabel: 'Delete',
        cancelLabel: 'Cancel',
      },
    }).then(() => {
      removeTransactions({
        variables: {
          parentId,
        },
      });
    });

  return (
    <div className="flex justify-end items-center col-span-2 xl:col-span-3 gap-6">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-accent-foreground">Sum Debit:</span>
        <span className="text-primary font-bold">
          <CurrencyFormatedDisplay
            currencyValue={{
              currencyCode: CurrencyCode.MNT,
              amountMicros: sumDebit,
            }}
          />
        </span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <span className="text-accent-foreground">Sum Credit:</span>
        <span className="text-primary font-bold">
          <CurrencyFormatedDisplay
            currencyValue={{
              currencyCode: CurrencyCode.MNT,
              amountMicros: sumCredit,
            }}
          />
        </span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <span className="text-accent-foreground">+CT:</span>
        <span className="text-primary font-bold">
          <CurrencyFormatedDisplay
            currencyValue={{
              currencyCode: CurrencyCode.MNT,
              amountMicros: (sumCredit - sumDebit),
            }}
          />
        </span>
      </div>
      <Button type="submit">
        <IconGavel />
        Save
      </Button>
      <Button
        variant="secondary"
        className="text-destructive"
        onClick={handleDelete}
      >
        <IconTrashX />
        {`Delete`}
      </Button>
    </div>
  );
};
