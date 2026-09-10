export type TDealSearchCategory = 'date' | 'number' | 'name';

export type TDealTextSearches = Record<
  Exclude<TDealSearchCategory, 'date'>,
  string
>;
