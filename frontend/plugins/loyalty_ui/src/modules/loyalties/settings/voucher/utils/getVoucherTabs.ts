export type VoucherTab =
  | 'campaign'
  | 'restriction'
  | 'productBonus'
  | 'lottery'
  | 'spin';

interface VoucherTabConfig {
  activeTab: VoucherTab;
  showProductBonusTab: boolean;
  showLotteryTab: boolean;
  showSpinTab: boolean;
}

export const getVoucherTabOrder = ({
  showProductBonusTab,
  showLotteryTab,
  showSpinTab,
}: Omit<VoucherTabConfig, 'activeTab'>): VoucherTab[] => {
  const tabs: VoucherTab[] = ['campaign', 'restriction'];

  if (showProductBonusTab) tabs.push('productBonus');
  if (showLotteryTab) tabs.push('lottery');
  if (showSpinTab) tabs.push('spin');

  return tabs;
};

export const getNextVoucherTab = (
  config: VoucherTabConfig,
): VoucherTab | null => {
  const tabs = getVoucherTabOrder(config);
  const currentIndex = tabs.indexOf(config.activeTab);

  return currentIndex < tabs.length - 1 ? tabs[currentIndex + 1] : null;
};

export const isLastVoucherTab = (config: VoucherTabConfig): boolean => {
  const tabs = getVoucherTabOrder(config);
  return config.activeTab === tabs[tabs.length - 1];
};
