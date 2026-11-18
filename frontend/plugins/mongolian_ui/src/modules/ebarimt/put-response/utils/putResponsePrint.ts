import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { IPutResponse } from '~/modules/ebarimt/put-response/types/PutResponseType';
import { EbarimtResponse } from '~/modules/ebarimt/responded/components/PerResponse';

export type TPrintablePutResponse = Pick<
  IPutResponse,
  | '_id'
  | 'id'
  | 'number'
  | 'date'
  | 'createdAt'
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

export const getDisplayDate = (
  putResponse: Pick<IPutResponse, 'date' | 'createdAt'>,
  timeZone: string,
): string => {
  if (putResponse.date) {
    // The receipt service returns UTC timestamps without a timezone suffix.
    const timestamp = /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}(?:\.\d+)?$/.test(putResponse.date)
      ? `${putResponse.date.replace(' ', 'T')}Z`
      : putResponse.date;
    const date = new Date(timestamp);

    if (!Number.isNaN(date.getTime())) {
      return formatInTimeZone(date, timeZone, 'yyyy-MM-dd HH:mm:ss');
    }
  }

  const { createdAt } = putResponse;
  return createdAt && !Number.isNaN(Date.parse(createdAt))
    ? format(new Date(createdAt), 'yyyy-MM-dd HH:mm:ss')
    : '-';
};

export const isActivePutResponse = (
  putResponse: Pick<IPutResponse, 'state'>,
) => putResponse.state !== 'inactive';

export const getPutResponseStatus = (
  putResponse: Pick<IPutResponse, 'status' | 'state'>,
): { variant: 'success' | 'secondary' | 'destructive'; label: string } => {
  if (putResponse.status !== 'SUCCESS') {
    return { variant: 'destructive', label: 'error' };
  }

  if (!isActivePutResponse(putResponse)) {
    return { variant: 'secondary', label: 'inactive' };
  }

  return { variant: 'success', label: 'success' };
};

export const isPrintablePutResponse = (
  putResponse: Pick<IPutResponse, 'id' | 'state'>,
) => Boolean(putResponse.id) && isActivePutResponse(putResponse);

export const toPrintResponse = (
  putResponse: TPrintablePutResponse,
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
