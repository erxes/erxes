import { followTrDocsState } from '../states/trStates';
import { IconGavel, IconActivity, IconTrashX } from '@tabler/icons-react';
import { ITransaction, ITrDetail } from '@/transactions/types/Transaction';
import { ITransactionGroupForm, TTrDoc } from '../types/JournalForms';
import { TR_SIDES } from '../../types/constants';
import { useAtomValue } from 'jotai';
import { useTransactionsRemove } from '../hooks/useTransactionsRemove';
import { useWatch } from 'react-hook-form';
import {
  Button,
  CurrencyCode,
  CurrencyFormatedDisplay,
  ScrollArea,
  Sheet,
  useConfirm,
  useQueryState,
} from 'erxes-ui';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ActivityLogs, AddInternalNote } from 'ui-modules';

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

export const Summary = ({ form }: { form: ITransactionGroupForm }) => {
  const navigate = useNavigate();
  const { ptrNumber, trDocs } = useWatch({ control: form.control });
  const followTrDocs = useAtomValue(followTrDocsState);
  const [parentId] = useQueryState<string>('parentId');

  const [sheetOpen, setSheetOpen] = useState(false);

  const { removeTransactions } = useTransactionsRemove();
  const { confirm } = useConfirm();

  const [sumDebit, sumCredit] = sumDtAndCt(trDocs as TTrDoc[], followTrDocs);

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
    <div className="flex justify-end items-center col-span-2 xl:col-span-3 gap-6">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-accent-foreground">{ptrNumber}</span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <span className="text-accent-foreground">Дебет дүн:</span>
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
        <span className="text-accent-foreground">Кредит дүн:</span>
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
              amountMicros: sumCredit - sumDebit,
            }}
          />
        </span>
      </div>
      <Button type="submit">
        <IconGavel />
        Хадгалах
      </Button>
      <Button
        variant="secondary"
        className="text-destructive"
        onClick={handleDelete}
      >
        <IconTrashX />
        {`Устгах`}
      </Button>
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen} modal >
        <Sheet.Trigger asChild>
          <Button variant={'secondary'}>
            <IconActivity />
          </Button>
        </Sheet.Trigger>
        <Sheet.View className="lg:max-w-1/3 md:max-w-1/2 sm:max-w-md p-0">
          <Sheet.Header className="border-b gap-3 px-6 py-4">
            <Sheet.Title>Activities</Sheet.Title>
            <Sheet.Close />
          </Sheet.Header>
          <Sheet.Content className="p-0 flex flex-col overflow-hidden">
            <div className="h-full flex flex-col">
              <ScrollArea className="flex-1 min-h-0">
                <div className="pt-3">
                  <ActivityLogs
                    targetId={parentId || ''}
                    // customActivities={dealCustomActivities}
                    variant="backward"
                  />
                </div>
              </ScrollArea>

              {!!parentId && (
                <div className="shrink-0 pb-6 pt-2">
                  <AddInternalNote
                    contentTypeId={parentId}
                    contentType="accounting:transaction"
                  />
                </div>
              )}
            </div>
          </Sheet.Content>
        </Sheet.View>
      </Sheet>
    </div>
  );
};
