const leftDealIds = new Set<string>();

export const leaveDeletedDealPanel = (dealId: string, leave: () => void) => {
  if (leftDealIds.has(dealId)) {
    return;
  }

  leftDealIds.add(dealId);
  leave();
};
