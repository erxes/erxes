const IGNORED_QUERY_VARIABLE_KEYS = [
  'boardId',
  'pipelineId',
  'salesItemId',
  'tab',
  'archivedOnly',
];

const SKIP_PARSE_VARIABLE_KEYS = [
  'search'
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

  return vars;
};
