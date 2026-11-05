import { formatDate } from '@/utils/graphqlDate';

type ReportLocation = {
  pathname: string;
  search: string;
};

const queryParamByGroup: Record<string, string> = {
  accountCategoryId: 'accountCategoryId',
  accountId: 'accountIds',
  branchId: 'branchId',
  departmentId: 'departmentId',
  customerId: 'customerId',
  productId: 'productIds',
  fixedAssetId: 'fixedAssetIds',
  journal: 'journal',
  createdBy: 'createdUserId',
  contentId: 'contentId',
  contentType: 'contentType',
  ptrId: 'ptrId',
};

const getDatePart = (value: string) => {
  const isoDate = value.match(/^\d{4}-\d{2}-\d{2}/)?.[0];
  if (isoDate) {
    return isoDate;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

type ReportPeriodKey = 'fromDate' | 'toDate';

type ReportPeriodTime = { hour: number; minute: number };

export const REPORT_PERIOD_DEFAULT_TIME: Record<
  ReportPeriodKey,
  ReportPeriodTime
> = {
  fromDate: { hour: 0, minute: 0 },
  toDate: { hour: 23, minute: 59 },
};

export const setReportPeriodTime = (
  day: Date,
  { hour, minute }: ReportPeriodTime,
) => new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour, minute);

export const getReportPeriodParam = (key: ReportPeriodKey, date: Date) => {
  const minutePart = formatDate(date, 'yyyy-MM-dd HH:mm');
  return key === 'toDate' ? `${minutePart}:59.999` : `${minutePart}:00`;
};

export const formatReportPeriodQuery = (value: unknown) => {
  if (typeof value !== 'string' || !value) {
    return '';
  }

  return formatDate(value, 'yyyy-MM-dd HH:mm');
};

const isBefore = (left: string, right: string) =>
  new Date(left).getTime() < new Date(right).getTime();

const setDayWithinPeriod = (params: URLSearchParams, datePart: string) => {
  const dayStart = `${datePart} 00:00:00`;
  const dayEnd = `${datePart} 23:59:59.999`;
  const fromDate = params.get('fromDate');
  const toDate = params.get('toDate');

  params.set(
    'fromDate',
    fromDate && isBefore(dayStart, fromDate) ? fromDate : dayStart,
  );
  params.set('toDate', toDate && isBefore(toDate, dayEnd) ? toDate : dayEnd);
};

export const getReportGroupsFromAttr = (attr: string) =>
  attr
    .split(/[,*]/)
    .map((entry) => {
      const separatorIndex = entry.indexOf('+');
      if (separatorIndex < 1) {
        return { group: '', id: '' };
      }

      return {
        group: entry.slice(0, separatorIndex),
        id: entry.slice(separatorIndex + 1),
      };
    })
    .filter(({ group, id }) => group && id);

export const buildDetailedReportPath = (
  location: ReportLocation,
  report: string,
  attr: string,
) => {
  const params = new URLSearchParams(location.search);

  params.set('report', report);
  params.set('isMore', 'true');

  getReportGroupsFromAttr(attr).forEach(({ group, id }) => {
    if (group === 'date') {
      const datePart = getDatePart(id);
      if (datePart) {
        setDayWithinPeriod(params, datePart);
      }
      return;
    }

    const queryParam = queryParamByGroup[group];
    if (queryParam) {
      params.set(queryParam, id);
    }
  });

  return `${location.pathname}?${params.toString()}`;
};
