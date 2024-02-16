const getCreditsInfo = `
  query getCreditsInfo {
    getCreditsInfo {
      name
      type
      initialCount
      growthInitialCount
      unit
      comingSoon
      unLimited

      price {
        monthly
        yearly
        oneTime
      }

      usage {
        totalAmount
        purchasedAmount
        freeAmount
        promoCodeAmount
        remainingAmount
        usedAmount
      }

      title
    }
  }
`;

export default {
  getCreditsInfo,
};
