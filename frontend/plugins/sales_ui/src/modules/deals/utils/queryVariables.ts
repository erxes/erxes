import { parseDateRangeFromString } from 'erxes-ui';

const IGNORED_QUERY_VARIABLE_KEYS = [
  'boardId',
  'pipelineId',
  'salesItemId',
  'tab',
  'archivedOnly',
  'archivedSort',
];

const DATE_RANGE_MAP: Record<string, [string, string]> = {
  createdStartDate: ['createdStartDate', 'createdEndDate'],
  startDateStartDate: ['startDateStartDate', 'startDateEndDate'],
  closeDateStartDate: ['closeDateStartDate', 'closeDateEndDate'],
  stageChangedStartDate: ['stageChangedStartDate', 'stageChangedEndDate'],
};

const DATE_UPPER_BOUND_KEYS = new Set([
  'startDateEndDate',
  'createdEndDate',
  'closeDateEndDate',
  'stageChangedEndDate',
]);

const parseValidRange = (value: string) => {
  const range = parseDateRangeFromString(value);
  if (
    !range ||
    Number.isNaN(range.from.getTime()) ||
    Number.isNaN(range.to.getTime())
  ) {
    return undefined;
  }
  return range;
};

const resolveParam = (
  vars: Record<string, any>,
  key: string,
  value: string,
) => {
  const dateRangePair = DATE_RANGE_MAP[key];
  if (dateRangePair) {
    const range = parseValidRange(value);
    if (range) {
      const [startKey, endKey] = dateRangePair;
      vars[startKey] = range.from.toISOString();
      vars[endKey] = range.to.toISOString();
    }
    return;
  }

  if (DATE_UPPER_BOUND_KEYS.has(key)) {
    const range = parseValidRange(value);
    if (range) vars[key] = range.to.toISOString();
    return;
  }

  try {
    vars[key] = JSON.parse(value);
  } catch {
    vars[key] = value;
  }
};

export const getDealsQueryVariables = (searchParams: URLSearchParams) => {
  const vars: Record<string, any> = {};

  for (const [key, value] of searchParams.entries()) {
    if (!IGNORED_QUERY_VARIABLE_KEYS.includes(key)) {
      resolveParam(vars, key, value);
    }
  }


  if (vars.productId) {
    vars.productIds = Array.isArray(vars.productId)
      ? vars.productId
      : [vars.productId];
    delete vars.productId;
  }

  if (searchParams.get('archivedOnly') === 'true') {
    vars.noSkipArchive = true;
    const sortDir = searchParams.get('archivedSort') || 'desc';
    vars.orderBy = { createdAt: sortDir === 'asc' ? 1 : -1 };
  }

  return vars;
};