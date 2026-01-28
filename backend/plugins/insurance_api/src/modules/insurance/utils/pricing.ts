export function calculatePremium(
  pricingConfig: any,
  insuredObject: any,
): number {
  const assessedValue = insuredObject?.assessedValue || 0;
  const percentage = pricingConfig?.percentage || 3;
  return assessedValue * (percentage / 100);
}
