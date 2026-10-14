import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';

// Each old name matched several documents. Keep that refetch coverage after
// renaming, including unchanged operations provided by shared UI or plugins.
const REFETCH_QUERY_NAMES = {
  Deals: ['Deals', 'salesDealList', 'salesDealSearchDropdown'],
  SalesStages: ['SalesStages', 'salesDealStages', 'salesDealConversionStages'],
  posList: [
    'posList',
    'salesPosSettingsList',
    'salesPosNavigationList',
    'salesPosOrdersPosList',
    'salesPosByItemsPosList',
    'salesPosCoversPosList',
    'salesPosItemsPosList',
    'salesPosSummaryPosList',
  ],
  posDetail: [
    'posDetail',
    'salesPosSettingsDetail',
    'salesPosOrdersInlineDetail',
    'salesPosOrdersSelectDetail',
    'salesPosCoversInlineDetail',
    'salesPosCoversSelectDetail',
    'salesPosItemsInlineDetail',
    'salesPosItemsSelectDetail',
    'salesPosSummaryInlineDetail',
    'salesPosSummarySelectDetail',
  ],
};

export const getSalesRefetchQueries = (
  client: Pick<ApolloClient<NormalizedCacheObject>, 'getObservableQueries'>,
  group: keyof typeof REFETCH_QUERY_NAMES,
): string[] => {
  const names = new Set(REFETCH_QUERY_NAMES[group]);
  const registeredNames = new Set<string>();

  // Named refetches include registered queries without observers, but exclude
  // standby queries. Listing only registered names avoids unknown-query warnings.
  client.getObservableQueries('all').forEach(({ queryName, options }) => {
    if (
      queryName &&
      options.fetchPolicy !== 'standby' &&
      names.has(queryName)
    ) {
      registeredNames.add(queryName);
    }
  });

  return [...registeredNames];
};
