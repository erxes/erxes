import { followTrDocsState } from '../states/trStates';
import { IconGavel, IconActivity, IconTrashX } from '@tabler/icons-react';
import { ITransaction, ITrDetail } from '@/transactions/types/Transaction';
import { ITransactionGroupForm, TTrDoc } from '../types/JournalForms';
import { TR_SIDES, TR_STATUS_LABELS } from '../../types/constants';
import { useAtomValue } from 'jotai';
import { useTransactionsRemove } from '../hooks/useTransactionsRemove';
import { useWatch } from 'react-hook-form';
import {
  Badge,
  Button,
  CurrencyCode,
  CurrencyFormatedDisplay,
  ScrollArea,
  Sheet,
  useConfirm,
  useQueryState,
} from 'erxes-ui';
import { useNavigate } from 'react-router-dom';
import { ReactNode, useState } from 'react';
import {
  ActivityLogCustomActivity,
  ActivityLogs,
  AddInternalNote,
  MembersInline,
  TActivityLog,
} from 'ui-modules';

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

const Sentence = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-wrap items-center gap-1 text-sm text-foreground">
    {children}
  </div>
);

const StatusBadge = ({ status }: { status?: string }) => {
  if (!status) {
    return null;
  }

  return (
    <Badge variant="secondary" className="font-medium">
      {TR_STATUS_LABELS[status] || status}
    </Badge>
  );
};

const MentionMembers = ({ memberIds }: { memberIds?: string[] }) => {
  const ids = [...new Set((memberIds || []).filter(Boolean))];

  if (!ids.length) {
    return null;
  }

  return (
    <MembersInline
      memberIds={ids}
      placeholder="Тодорхойгүй хэрэглэгч"
      className="font-medium"
    />
  );
};

const TrCreatedActivityRow = ({ activity }: { activity: TActivityLog }) => {
  const current = activity.changes?.current || {};

  return (
    <Sentence>
      <ActivityLogs.ActorName activity={activity} />
      <span className="text-muted-foreground">баримт үүсгэв</span>
      <StatusBadge status={current.status || activity.metadata?.status} />
      <MentionMembers memberIds={current.mentionUserIds} />
    </Sentence>
  );
};

const TrStatusActivityRow = ({ activity }: { activity: TActivityLog }) => {
  const prev = activity.changes?.prev || {};
  const current = activity.changes?.current || {};

  return (
    <Sentence>
      <ActivityLogs.ActorName activity={activity} />
      <span className="text-muted-foreground">төлөв өөрчлөв</span>
      <StatusBadge status={prev.status} />
      <span className="text-muted-foreground">-&gt;</span>
      <StatusBadge status={current.status} />
    </Sentence>
  );
};

const TrMentionActivityRow = ({ activity }: { activity: TActivityLog }) => {
  const prev = activity.changes?.prev || {};
  const current = activity.changes?.current || {};

  return (
    <div className="flex flex-col gap-1">
      <Sentence>
        <ActivityLogs.ActorName activity={activity} />
        <span className="text-muted-foreground">батлуулах хэрэглэгч өөрчлөв</span>
      </Sentence>
      <div className="flex flex-wrap items-center gap-2 pl-0 text-sm">
        <span className="text-muted-foreground">Өмнө:</span>
        <MentionMembers memberIds={prev.mentionUserIds} />
        <span className="text-muted-foreground">Одоо:</span>
        <MentionMembers memberIds={current.mentionUserIds} />
      </div>
    </div>
  );
};

const transactionCustomActivities: ActivityLogCustomActivity[] = [
  {
    type: 'transaction.created',
    render: (activity) => <TrCreatedActivityRow activity={activity} />,
  },
  {
    type: 'transaction.status_changed',
    render: (activity) => <TrStatusActivityRow activity={activity} />,
  },
  {
    type: 'transaction.mention_changed',
    render: (activity) => <TrMentionActivityRow activity={activity} />,
  },
];

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
                    customActivities={transactionCustomActivities}
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
