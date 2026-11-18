import { useTranslation } from 'react-i18next';
import { ITransaction, ITrDetail } from '@/transactions/types/Transaction';
import {
  IconChevronLeft,
  IconFilePencil,
  IconGavel,
  IconTrashX,
} from '@tabler/icons-react';
import {
  Button,
  cn,
  CurrencyCode,
  CurrencyFormatedDisplay,
  fixNum,
  Spinner,
  Tooltip,
  useConfirm,
  useQueryState,
} from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useState } from 'react';
import { useWatch } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { TR_SIDES, TR_STATUS_GROUPS } from '../../types/constants';
import { getTransactionReturnPath } from '../../utils/transactionNavigation';
import { useTransactionsRemove } from '../hooks/useTransactionsRemove';
import { followTrDocsState } from '../states/trStates';
import { ITransactionGroupForm, TTrDoc } from '../types/JournalForms';
import { TrRightSidebar } from './TrRightSidebar';
import { isHiddenTransaction } from './utils';

type TSummableTrDoc = {
  side?: string | null;
  details?: Pick<ITrDetail, 'amount'>[] | null;
};

const getSum = (
  trDocs: TSummableTrDoc[],
  sumDebit: number,
  sumCredit: number,
) => {
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

const DRAFTED_STATUSES =
  TR_STATUS_GROUPS.find(({ label }) => label === 'DRAFTED')?.values || [];

export const Summary = ({
  errorMessage,
  form,
  saving,
}: {
  errorMessage?: string;
  form: ITransactionGroupForm;
  saving?: boolean;
}) => {
  const { t } = useTranslation('accounting');
  const [showMore, setShowMore] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnPath = getTransactionReturnPath(searchParams.get('returnTo'));
  const { ptrNumber, status, trDocs } = useWatch({ control: form.control });
  const followTrDocs = useAtomValue(followTrDocsState);
  const [parentId] = useQueryState<string>('parentId');

  const { removeTransactions, loading: removing } = useTransactionsRemove();
  const { confirm } = useConfirm();

  const [sumDebit, sumCredit] = sumDtAndCt(trDocs as TTrDoc[], followTrDocs);
  const diffAmount = fixNum(sumCredit - sumDebit, 4);
  const hasHiddenTransaction = (trDocs || []).some(isHiddenTransaction);
  const isDraftedStatus = DRAFTED_STATUSES.includes(status || '');
  const SubmitIcon = isDraftedStatus ? IconFilePencil : IconGavel;

  const saveDisabledReason =
    errorMessage ||
    (hasHiddenTransaction
      ? t(
          'unable-to-save-because-some-transactions-cannot-be-viewed-with-your-current-permissions',
        )
      : undefined);

  const saveButton = (
    <Button
      type="submit"
      variant={isDraftedStatus ? 'secondary' : 'default'}
      className={isDraftedStatus ? 'text-warning' : undefined}
      disabled={!!saveDisabledReason || saving}
      title={
        isDraftedStatus && !saveDisabledReason
          ? t('save-with-draft-status')
          : undefined
      }
    >
      {saving ? <Spinner /> : <SubmitIcon />}
      {t('save')}
    </Button>
  );

  const handleDelete = () =>
    confirm({
      message: t('delete-these-transactions'),
      options: {
        okLabel: t('delete'),
        cancelLabel: t('cancel-label'),
      },
    }).then(() => {
      if (!parentId) {
        return navigate(returnPath);
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
          title={showMore ? t('collapse') : t('expand')}
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
              <span className="text-accent-foreground">
                {t('debit-label', { nsSeparator: false })}
              </span>
              <span
                className={cn(
                  'font-bold',
                  isDraftedStatus ? 'text-warning' : 'text-primary',
                )}
              >
                <CurrencyFormatedDisplay
                  currencyValue={{
                    currencyCode: CurrencyCode.MNT,
                    amountMicros: sumDebit,
                  }}
                />
              </span>
            </div>
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span className="text-accent-foreground">
                {t('credit-label', { nsSeparator: false })}
              </span>
              <span
                className={cn(
                  'font-bold',
                  isDraftedStatus ? 'text-warning' : 'text-primary',
                )}
              >
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
                <span className="text-accent-foreground">
                  {t('difference-label', { nsSeparator: false })}
                </span>
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
      {saveDisabledReason ? (
        <Tooltip>
          <Tooltip.Trigger asChild>
            <span>{saveButton}</span>
          </Tooltip.Trigger>
          <Tooltip.Content side="bottom" className="max-w-64">
            {saveDisabledReason}
          </Tooltip.Content>
        </Tooltip>
      ) : (
        saveButton
      )}
      <Button
        variant="secondary"
        className="text-destructive"
        disabled={!!errorMessage || removing}
        onClick={handleDelete}
      >
        {removing ? <Spinner /> : <IconTrashX />}
        {t('delete')}
      </Button>
      <TrRightSidebar />
    </div>
  );
};
