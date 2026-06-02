import { parseDateRangeFromString } from 'erxes-ui';

const IGNORED_QUERY_VARIABLE_KEYS = [
  'boardId',
  'pipelineId',
  'salesItemId',
  'tab',
  'archivedOnly',
];

const SKIP_PARSE_VARIABLE_KEYS = ['search', 'productId'];

const DATE_RANGE_PAIRS: [string, string][] = [
  ['createdStartDate', 'createdEndDate'],
  ['startDateStartDate', 'startDateEndDate'],
  ['closeDateStartDate', 'closeDateEndDate'],
  ['stateChangedStartDate', 'stateChangedEndDate'],
];

export const getDealsQueryVariables = (searchParams: URLSearchParams) => {
  const vars: Record<string, any> = {};

  for (const [key, value] of searchParams.entries()) {
    if (IGNORED_QUERY_VARIABLE_KEYS.includes(key)) continue;

    if (!SKIP_PARSE_VARIABLE_KEYS.includes(key)) {
      vars[key] = value;
      continue;
    }

    try {
      vars[key] = JSON.parse(value);
    } catch {
      vars[key] = value;
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
  }

  for (const [startKey, endKey] of DATE_RANGE_PAIRS) {
    if (vars[startKey]) {
      const range = parseDateRangeFromString(vars[startKey]);
      if (range) {
        vars[startKey] = range.from.toISOString();
        if (!searchParams.has(endKey)) {
          vars[endKey] = range.to.toISOString();
        }
      } else {
        delete vars[startKey];
      }
    }
    if (vars[endKey]) {
      const range = parseDateRangeFromString(vars[endKey]);
      if (range) {
        vars[endKey] = range.to.toISOString();
      } else {
        delete vars[endKey];
      }
    }
  }

  return vars;
};
