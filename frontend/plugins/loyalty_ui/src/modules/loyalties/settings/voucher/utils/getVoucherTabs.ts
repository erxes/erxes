export type VoucherTab =
  | 'campaign'
  | 'restriction'
  | 'productBonus'
  | 'lottery'
  | 'spin';

export const getVoucherTabOrder = (type?: string): VoucherTab[] => {
  const tabs: VoucherTab[] = ['campaign', 'restriction'];

  if (type === 'bonus') tabs.push('productBonus');
  if (type === 'lottery') tabs.push('lottery');
  if (type === 'spin') tabs.push('spin');

  return tabs;
};

export const getNextVoucherTab = (
  current: VoucherTab,
  type?: string,
): VoucherTab | null => {
  const tabs = getVoucherTabOrder(type);
  const index = tabs.indexOf(current);

  return index < tabs.length - 1 ? tabs[index + 1] : null;
};

export const isLastVoucherTab = (
  current: VoucherTab,
  type?: string,
): boolean => {
  const tabs = getVoucherTabOrder(type);
  return current === tabs[tabs.length - 1];
};
