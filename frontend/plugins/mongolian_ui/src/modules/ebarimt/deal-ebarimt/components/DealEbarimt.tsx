import { useQuery } from '@apollo/client';
import {
  IconAlertCircle,
  IconPrinter,
  IconReceiptTax,
} from '@tabler/icons-react';
import { Badge, Button, Separator, Spinner, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { RelationWidgetEmptyState, RelationWidgetList } from 'ui-modules';
import { MONGOLIAN_DEAL_PUT_RESPONSES } from '~/modules/ebarimt/deal-ebarimt/graphql/dealPutResponsesQuery';
import { getDisplayDate } from '~/modules/ebarimt/put-response/components/PutResponseColumn';
import { MONGOLIAN_PUT_RESPONSE_TIMEZONE } from '~/modules/ebarimt/put-response/graphql/queries/PutResponseQueries';
import { IPutResponse } from '~/modules/ebarimt/put-response/types/PutResponseType';
import { EbarimtResponse } from '~/modules/ebarimt/responded/components/PerResponse';
import { printEbarimtResponses } from '~/modules/ebarimt/responded/utils/printEbarimtResponses';

const DEAL_PUT_RESPONSES_LIMIT = 20;

type TDealPutResponse = Pick<
  IPutResponse,
  | '_id'
  | 'id'
  | 'number'
  | 'date'
  | 'createdAt'
  | 'type'
  | 'state'
  | 'status'
  | 'message'
  | 'merchantTin'
  | 'customerTin'
  | 'customerName'
  | 'consumerNo'
  | 'lottery'
  | 'qrData'
  | 'receipts'
  | 'totalAmount'
  | 'totalVAT'
  | 'totalCityTax'
>;

const formatAmount = (value?: number) =>
  (value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const isActive = (putResponse: TDealPutResponse) =>
  putResponse.state !== 'inactive';

const getStatus = (
  putResponse: TDealPutResponse,
): { variant: 'success' | 'secondary' | 'destructive'; label: string } => {
  if (putResponse.status !== 'SUCCESS') {
    return { variant: 'destructive', label: 'error' };
  }

  if (!isActive(putResponse)) {
    return { variant: 'secondary', label: 'inactive' };
  }

  return { variant: 'success', label: 'success' };
};

const toPrintResponse = (
  putResponse: TDealPutResponse,
  timeZone: string,
): EbarimtResponse => ({
  _id: putResponse._id,
  id: putResponse.id,
  number: putResponse.number,
  date: getDisplayDate(putResponse, timeZone),
  status: putResponse.status,
  message: putResponse.message,
  merchantTin: putResponse.merchantTin,
  customerTin: putResponse.customerTin || undefined,
  customerName: putResponse.customerName || undefined,
  consumerNo: putResponse.consumerNo || undefined,
  lottery: putResponse.lottery || undefined,
  qrData: putResponse.qrData || undefined,
  receipts: putResponse.receipts,
  totalAmount: putResponse.totalAmount,
  totalVAT: putResponse.totalVAT,
  totalCityTax: putResponse.totalCityTax,
});

export const DealEbarimt = ({ contentId }: { contentId: string }) => {
  const { t } = useTranslation('mongolian');
  const { toast } = useToast();
  const { data: timezoneData, loading: timezoneLoading } = useQuery<{
    timeZone?: { value?: unknown } | null;
  }>(MONGOLIAN_PUT_RESPONSE_TIMEZONE);
  const { data, loading, error } = useQuery<{
    putResponses?: { list?: TDealPutResponse[]; totalCount?: number };
  }>(MONGOLIAN_DEAL_PUT_RESPONSES, {
    variables: { contentId, limit: DEAL_PUT_RESPONSES_LIMIT },
    fetchPolicy: 'network-only',
    skip: !contentId,
  });

  const configuredTimeZone = timezoneData?.timeZone?.value;
  const timeZone =
    typeof configuredTimeZone === 'string' && configuredTimeZone.trim()
      ? configuredTimeZone
      : 'UTC';
  const putResponses = data?.putResponses?.list || [];
  const totalCount = data?.putResponses?.totalCount || 0;
  const printableResponses = putResponses.filter(
    (putResponse) => putResponse.id && isActive(putResponse),
  );

  const handlePrint = (responses: TDealPutResponse[]) => {
    const printed = printEbarimtResponses(
      responses.map((putResponse) => toPrintResponse(putResponse, timeZone)),
    );

    if (!printed) {
      toast({
        title: t('error'),
        description: t('allow-popups-to-print'),
        variant: 'destructive',
      });
    }
  };

  if (loading || timezoneLoading) {
    return <Spinner containerClassName="py-20" />;
  }

  if (error) {
    return (
      <RelationWidgetEmptyState
        icon={IconAlertCircle}
        message={error.message}
      />
    );
  }

  if (!putResponses.length) {
    return (
      <RelationWidgetEmptyState
        icon={IconReceiptTax}
        message={t('no-deal-ebarimt')}
      />
    );
  }

  return (
    <RelationWidgetList
      label={t('ebarimt-responses-count', { count: totalCount })}
      actions={
        <Button
          variant="secondary"
          disabled={!printableResponses.length}
          onClick={() => handlePrint(printableResponses)}
        >
          <IconPrinter />
          {t('print-receipt')}
        </Button>
      }
    >
      {putResponses.map((putResponse) => {
        const status = getStatus(putResponse);

        return (
          <div
            key={putResponse._id}
            className="rounded border bg-background p-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">
                  {putResponse.id || putResponse.number || t('ebarimt')}
                </div>
                <div className="text-xs text-muted-foreground">
                  {[putResponse.type, getDisplayDate(putResponse, timeZone)]
                    .filter(Boolean)
                    .join(' | ')}
                </div>
              </div>
              <div className="flex flex-none items-center gap-1">
                <Badge variant={status.variant}>{t(status.label)}</Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={t('print-receipt')}
                  disabled={!putResponse.id || !isActive(putResponse)}
                  onClick={() => handlePrint([putResponse])}
                >
                  <IconPrinter />
                </Button>
              </div>
            </div>
            {putResponse.status !== 'SUCCESS' && putResponse.message && (
              <div className="mt-2 text-xs text-destructive">
                {putResponse.message}
              </div>
            )}
            <Separator className="my-2" />
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">
                  {t('total-amount')}
                </span>
                <div className="font-medium">
                  {formatAmount(putResponse.totalAmount)}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">{t('vat')}</span>
                <div className="font-medium">
                  {formatAmount(putResponse.totalVAT)}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">{t('city-tax')}</span>
                <div className="font-medium">
                  {formatAmount(putResponse.totalCityTax)}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </RelationWidgetList>
  );
};
