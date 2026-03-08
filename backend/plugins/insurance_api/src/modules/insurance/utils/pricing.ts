export function calculatePremium(
  pricingConfig: any,
  insuredObject: any,
): number {
  let totalAssessedValue = insuredObject?.assessedValue || 0;

  // Add trailer prices if they exist (for truck insurance)
  for (let i = 1; i <= 3; i++) {
    const trailerPrice = insuredObject?.[`Чиргүүл ${i} үнэ`];
    if (trailerPrice) {
      // Parse number with commas support
      const numValue = typeof trailerPrice === 'string' 
        ? parseFloat(trailerPrice.replace(/,/g, '')) 
        : trailerPrice;
      totalAssessedValue += numValue || 0;
    }
  }

  const percentage = pricingConfig?.percentage || 3;
  return Math.round(totalAssessedValue * (percentage / 100));
}
