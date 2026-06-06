import { ITransaction, ITrDetail } from '@/transactions/types/Transaction';
import { IconChevronLeft, IconGavel, IconTrashX } from '@tabler/icons-react';
import {
  Button,
  cn,
  CurrencyCode,
  CurrencyFormatedDisplay,
  fixNum,
  useConfirm,
  useQueryState,
} from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useState } from 'react';
import { useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { TR_SIDES } from '../../types/constants';
import { useTransactionsRemove } from '../hooks/useTransactionsRemove';
import { followTrDocsState } from '../states/trStates';
import { ITransactionGroupForm, TTrDoc } from '../types/JournalForms';
import { TrRightSidebar } from './TrRightSidebar';

const getSum = (trDocs: any[], sumDebit: number, sumCredit: number) => {
  trDocs?.forEach((tr) => {
    if (!tr?.details?.[0]) {
      return;
    }

    const perSum = tr.details.reduce(
      (sum: number, det: ITrDetail) => sum + (det.amount ?? 0),
      0,
    );
    if (tr.side === TR_SIDES.DEBIT) {
      sumDebit += perSum;
    } else {
      sumCredit += perSum;
    }
  });
  return [sumDebit, sumCredit];
};

export const sumDtAndCt = (trDocs: TTrDoc[], followTrDocs: ITransaction[]) => {
  const [sumDt, sumCt] = getSum(trDocs || [], 0, 0);
  const [sumDebit, sumCredit] = getSum(followTrDocs, sumDt, sumCt);
  return [sumDebit, sumCredit];
};

export const Summary = ({
  errorMessage,
  form,
}: {
  errorMessage?: string;
  form: ITransactionGroupForm;
}) => {
  const [showMore, setShowMore] = useState(false);
  const navigate = useNavigate();
  const { ptrNumber, trDocs } = useWatch({ control: form.control });
  const followTrDocs = useAtomValue(followTrDocsState);
  const [parentId] = useQueryState<string>('parentId');

  const { removeTransactions } = useTransactionsRemove();
  const { confirm } = useConfirm();

  const [sumDebit, sumCredit] = sumDtAndCt(trDocs as TTrDoc[], followTrDocs);
  const diffAmount = fixNum(sumCredit - sumDebit, 4);
  const hasHiddenTransaction = (trDocs || []).some(
    (trDoc: any) => trDoc?.permission === 'hidden',
  );

  const handleDelete = () =>
    confirm({
      message: 'Эдгээр гүйлгээг устгах уу?',
      options: {
        okLabel: 'Устгах',
        cancelLabel: 'Болих',
      },
    }).then(() => {
      if (!parentId) {
        const pathname = '/accounting/main';
        return navigate(pathname);
      }
      removeTransactions(parentId);
    });

  return (
    <div className="flex justify-end items-center col-span-2 xl:col-span-3 gap-3">
      <div className="flex min-w-0 items-center justify-end gap-3 text-sm">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7 shrink-0"
          onClick={() => setShowMore((prev) => !prev)}
          title={showMore ? 'Эвхэх' : 'Дэлгэх'}
        >
          <IconChevronLeft
            className={cn(
              'size-4 transition-transform',
              showMore && 'rotate-180',
            )}
          />
        </Button>

        {showMore ? (
          <div className="flex min-w-0 items-center justify-end gap-3 whitespace-nowrap">
            <span className="text-accent-foreground">[{ptrNumber}]</span>
          </div>
        ) : null}

        {errorMessage ? (
          <span className="max-w-80 truncate font-medium text-destructive">
            {errorMessage}
          </span>
        ) : (
          <>
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span className="text-accent-foreground">Дебет:</span>
              <span className="font-bold text-primary">
                <CurrencyFormatedDisplay
                  currencyValue={{
                    currencyCode: CurrencyCode.MNT,
                    amountMicros: sumDebit,
                  }}
                />
              </span>
            </div>
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span className="text-accent-foreground">Кредит:</span>
              <span className="font-bold text-primary">
                <CurrencyFormatedDisplay
                  currencyValue={{
                    currencyCode: CurrencyCode.MNT,
                    amountMicros: sumCredit,
                  }}
                />
              </span>
            </div>

            {showMore ? (
              <div className="flex items-center gap-2 whitespace-nowrap">
                <span className="text-accent-foreground">Зөрүү:</span>
                <span
                  className={cn(
                    'font-bold',
                    diffAmount ? 'text-destructive' : 'text-primary',
                  )}
                >
                  <CurrencyFormatedDisplay
                    currencyValue={{
                      currencyCode: CurrencyCode.MNT,
                      amountMicros: diffAmount,
                    }}
                  />
                </span>
              </div>
            ) : null}
          </>
        )}
      </div>
      <Button
        type="submit"
        disabled={hasHiddenTransaction || !!errorMessage}
        title={
          errorMessage ||
          (hasHiddenTransaction
            ? 'Унших эрх хүрэхгүй гүйлгээ байгаа тул хадгалах боломжгүй'
            : undefined)
        }
      >
        <IconGavel />
        Хадгалах
      </Button>
      <Button
        variant="secondary"
        className="text-destructive"
        disabled={!!errorMessage}
        onClick={handleDelete}
      >
        <IconTrashX />
        {`Устгах`}
      </Button>
      <TrRightSidebar form={form} />
    </div>
  );
};
