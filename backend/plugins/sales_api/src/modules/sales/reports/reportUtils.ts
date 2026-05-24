// backend/plugins/sales_api/src/modules/sales/reports/reportUtils.ts

import { sendTRPCMessage } from 'erxes-api-shared/utils';
import dayjs from 'dayjs';

/**
 * Build a date filter for any given field, supporting both explicit dates
 * and preset date ranges (today, thisWeek, lastMonth, etc.).
 */
export const buildDateFilter = (
  filters: any,
  field: string
): Record<string, any> => {
  const { dateRange, fromDate, toDate } = filters;

  // Explicit custom date range takes precedence over preset
  if (fromDate || toDate) {
    const range: { $gte?: Date; $lte?: Date } = {};
    if (fromDate) range.$gte = new Date(fromDate);
    if (toDate) range.$lte = new Date(toDate);
    return { [field]: range };
  }

  // If no explicit dates, check for a preset date range
  if (!dateRange || dateRange === 'all') {
    return {};
  }

  // Use dayjs to compute the start/end of the preset period
  const NOW = new Date();
  let $gte, $lte;

  switch (dateRange) {
    case 'today':
      $gte = dayjs(NOW).startOf('day').toDate();
      $lte = dayjs(NOW).endOf('day').toDate();
      break;
    case 'yesterday':
      $gte = dayjs(NOW).subtract(1, 'day').startOf('day').toDate();
      $lte = dayjs(NOW).subtract(1, 'day').endOf('day').toDate();
      break;
    case 'last72h':
      $gte = dayjs(NOW).subtract(3, 'day').startOf('day').toDate();
      $lte = dayjs(NOW).endOf('day').toDate();
      break;
    case 'thisWeek':
      $gte = dayjs(NOW).startOf('week').toDate();
      $lte = dayjs(NOW).endOf('week').toDate();
      break;
    case 'lastWeek':
      $gte = dayjs(NOW).subtract(1, 'week').startOf('week').toDate();
      $lte = dayjs(NOW).subtract(1, 'week').endOf('week').toDate();
      break;
    case 'last2Week':
      $gte = dayjs(NOW).subtract(2, 'week').startOf('week').toDate();
      $lte = dayjs(NOW).subtract(1, 'week').endOf('week').toDate();
      break;
    case 'last3Week':
      $gte = dayjs(NOW).subtract(3, 'week').startOf('week').toDate();
      $lte = dayjs(NOW).subtract(1, 'week').endOf('week').toDate();
      break;
    case 'lastMonth':
      $gte = dayjs(NOW).subtract(1, 'month').startOf('month').toDate();
      $lte = dayjs(NOW).subtract(1, 'month').endOf('month').toDate();
      break;
    case 'thisMonth':
      $gte = dayjs(NOW).startOf('month').toDate();
      $lte = dayjs(NOW).endOf('month').toDate();
      break;
    case 'thisYear':
      $gte = dayjs(NOW).startOf('year').toDate();
      $lte = dayjs(NOW).endOf('year').toDate();
      break;
    case 'lastYear':
      $gte = dayjs(NOW).subtract(1, 'year').startOf('year').toDate();
      $lte = dayjs(NOW).subtract(1, 'year').endOf('year').toDate();
      break;
    // 'customDate' is handled by explicit fromDate/toDate above
    default:
      return {};
  }

  return { [field]: { $gte, $lte } };
};

/**
 * Add $group stage for time‑based grouping (day, week, month, year).
 * Now accepts an optional `measure` expression; defaults to counting.
 */
export const buildDateGroup = (
  field: string,
  frequency?: string,
  measure: Record<string, any> = { count: { $sum: 1 } }
): any[] => {
  const freq = frequency?.toLowerCase() || 'day';
  let groupId: any;

  if (freq === 'year') {
    groupId = { $dateToString: { format: '%Y', date: `$${field}` } };
  } else if (freq === 'month') {
    groupId = { $dateToString: { format: '%Y-%m', date: `$${field}` } };
  } else if (freq === 'week') {
    groupId = {
      $concat: [
        { $toString: { $isoWeekYear: `$${field}` } },
        '-W',
        {
          $toString: {
            $cond: [
              { $lt: [{ $isoWeek: `$${field}` }, 10] },
              { $concat: ['0', { $toString: { $isoWeek: `$${field}` } }] },
              { $toString: { $isoWeek: `$${field}` } },
            ],
          },
        },
      ],
    };
  } else {
    // default to day
    groupId = { $dateToString: { format: '%Y-%m-%d', date: `$${field}` } };
  }

  return [
    { $group: { _id: groupId, ...measure } },
    { $sort: { _id: 1 } },
  ];
};

/**
 * Build a due date filter (due / overdue) for a given field.
 * Supports preset ranges: today, thisWeek, thisMonth, thisYear.
 */
export const buildDueDateFilter = (
  filters: any,
  field: string
): Record<string, any> => {
  const { dueDateRange, dueType = 'due' } = filters;
  if (!dueDateRange) return {};

  const NOW = new Date();
  let $gte, $lte;

  if (dueType === 'due') {
    switch (dueDateRange) {
      case 'today':
        $gte = NOW;
        $lte = new Date(NOW.setHours(23, 59, 59, 999));
        break;
      case 'thisWeek':
        $gte = NOW;
        $lte = dayjs(NOW).add(7, 'day').toDate();
        break;
      case 'thisMonth':
        $gte = NOW;
        $lte = dayjs(NOW).add(1, 'month').toDate();
        break;
      case 'thisYear':
        $gte = NOW;
        $lte = dayjs(NOW).add(1, 'year').toDate();
        break;
      default:
        break;
    }
  } else if (dueType === 'overdue') {
    switch (dueDateRange) {
      case 'today':
        $gte = dayjs(NOW).startOf('day').toDate();
        $lte = NOW;
        break;
      case 'thisWeek':
        $gte = dayjs(NOW).subtract(7, 'day').toDate();
        $lte = NOW;
        break;
      case 'thisMonth':
        $gte = dayjs(NOW).subtract(1, 'month').toDate();
        $lte = NOW;
        break;
      case 'thisYear':
        $gte = dayjs(NOW).subtract(1, 'year').toDate();
        $lte = NOW;
        break;
      default:
        break;
    }
  }

  if ($gte && $lte) {
    return { [field]: { $gte, $lte } };
  }
  return {};
};

/**
 * Fetch IDs from a related collection (via conformity) using sendTRPCMessage.
 */
export const getRelatedIds = async (
  subdomain: string,
  mainType: string,
  mainTypeIds: string[],
  relType: string
): Promise<string[]> => {
  const result = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    module: 'conformities',
    action: 'filterConformity',
    input: { mainType, mainTypeIds, relType },
    defaultValue: [],
  });
  return result;
};