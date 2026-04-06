export interface IDiscountTier {
  minTravelers: number;
  discountPercent: number;
}

export function calculateTravelPremium(
  dailyRate: number,
  startDate: string | Date,
  endDate: string | Date,
  travelerCount: number,
  discountTiers?: IDiscountTier[],
): { perPerson: number; total: number; discountPercent: number } {
  const days = Math.ceil(
    (new Date(endDate).getTime() - new Date(startDate).getTime()) /
      (1000 * 60 * 60 * 24),
  );
  const safeDays = Math.max(days, 1);
  const safeCount = Math.max(travelerCount, 1);

  const grossTotal = dailyRate * safeDays * safeCount;

  let discountPercent = 0;
  if (discountTiers && discountTiers.length > 0) {
    const sorted = [...discountTiers].sort(
      (a, b) => b.minTravelers - a.minTravelers,
    );
    for (const tier of sorted) {
      if (safeCount >= tier.minTravelers) {
        discountPercent = tier.discountPercent;
        break;
      }
    }
  }

  const total = Math.round(grossTotal * (1 - discountPercent / 100));
  const perPerson = Math.round(total / safeCount);

  return { perPerson, total, discountPercent };
}

export function calculateTravelTieredFee(
  durationTiers: { minDays: number; maxDays: number; fee: number }[],
  days: number,
): number {
  const sorted = [...durationTiers].sort((a, b) => a.minDays - b.minDays);
  for (const tier of sorted) {
    if (days >= tier.minDays && days <= tier.maxDays) {
      return tier.fee;
    }
  }
  // If beyond all tiers, use the last tier
  if (sorted.length > 0 && days > sorted[sorted.length - 1].maxDays) {
    return sorted[sorted.length - 1].fee;
  }
  return 0;
}

/**
 * Formula-based travel insurance pricing: y = ax + b
 * where x = days, y = fee (in thousands ₮)
 * Each formula has two ranges: ≤21 days and >21 days
 */
export interface ITravelFormula {
  regionId: string;
  regionName: string;
  slope21: number;       // 'a' for ≤21 days
  intercept21: number;   // 'b' for ≤21 days
  slope21plus: number;   // 'a' for >21 days
  intercept21plus: number; // 'b' for >21 days
}

export function calculateFormulaFee(
  formula: ITravelFormula,
  days: number,
): number {
  const safeDays = Math.max(days, 1);
  let fee: number;

  if (safeDays <= 21) {
    fee = formula.slope21 * safeDays + formula.intercept21;
  } else {
    fee = formula.slope21plus * safeDays + formula.intercept21plus;
  }

  // Fee is in thousands ₮, convert and round
  return Math.round(fee * 1000);
}

export function calculatePremium(
  pricingConfig: any,
  insuredObject: any,
): number {
  if (!pricingConfig) return 0;

  // Travel insurance: if insuredObject already has pre-calculated total, use it
  const preCalculatedTotal = insuredObject?.['Нийт хураамж'];
  if (preCalculatedTotal && preCalculatedTotal > 0) {
    return preCalculatedTotal;
  }

  // Travel insurance: formula-based pricing (y = ax + b)
  if (pricingConfig.formulas && pricingConfig.formulas.length > 0) {
    const regionName =
      insuredObject?.['Аялах бүс нутаг'] ||
      insuredObject?.['Бүс нутаг'] ||
      '';

    const startDate =
      insuredObject?.['Эхлэх огноо'] ||
      insuredObject?.['Гэрээний эхлэх огноо'];
    const endDate =
      insuredObject?.['Дуусах огноо'] ||
      insuredObject?.['Гэрээний дуусах огноо'];

    if (startDate && endDate) {
      const days = Math.ceil(
        (new Date(endDate).getTime() - new Date(startDate).getTime()) /
          (1000 * 60 * 60 * 24),
      );

      // Find matching formula by region name
      let formula = pricingConfig.formulas.find(
        (f: ITravelFormula) =>
          f.regionName === regionName || f.regionId === regionName,
      );

      // Fallback to first formula if no region match
      if (!formula) formula = pricingConfig.formulas[0];

      const perPersonFee = calculateFormulaFee(formula, days);

      // Calculate traveler count
      const travelerText = insuredObject?.['Аялагчид'] || '';
      const travelerCount = travelerText
        ? travelerText.split('\n').filter((l: string) => l.trim()).length
        : 1;

      return perPersonFee * Math.max(travelerCount, 1);
    }

    // No dates, use 1 day as default
    return calculateFormulaFee(pricingConfig.formulas[0], 1);
  }

  // Travel insurance: duration-tiered pricing (per person per trip)
  if (pricingConfig.durationTiers && pricingConfig.durationTiers.length > 0) {
    const startDate =
      insuredObject?.['Эхлэх огноо'] ||
      insuredObject?.['Гэрээний эхлэх огноо'] ||
      insuredObject?.travelStartDate;
    const endDate =
      insuredObject?.['Дуусах огноо'] ||
      insuredObject?.['Гэрээний дуусах огноо'] ||
      insuredObject?.travelEndDate;

    if (startDate && endDate) {
      const days = Math.ceil(
        (new Date(endDate).getTime() - new Date(startDate).getTime()) /
          (1000 * 60 * 60 * 24),
      );
      const perPersonFee = calculateTravelTieredFee(
        pricingConfig.durationTiers,
        Math.max(days, 1),
      );
      // Parse traveler count from insuredObject
      const travelerText = insuredObject?.['Аялагчид'] || '';
      const travelerCount = travelerText
        ? travelerText.split('\n').filter((l: string) => l.trim()).length
        : 1;
      return perPersonFee * Math.max(travelerCount, 1);
    }
    return pricingConfig.durationTiers[0]?.fee || 0;
  }

  // Travel insurance: daily rate × trip days
  if (pricingConfig.dailyRate) {
    const startDate =
      insuredObject?.['Эхлэх огноо'] ||
      insuredObject?.['Гэрээний эхлэх огноо'] ||
      insuredObject?.travelStartDate;
    const endDate =
      insuredObject?.['Дуусах огноо'] ||
      insuredObject?.['Гэрээний дуусах огноо'] ||
      insuredObject?.travelEndDate;

    if (startDate && endDate) {
      const days = Math.ceil(
        (new Date(endDate).getTime() - new Date(startDate).getTime()) /
          (1000 * 60 * 60 * 24),
      );
      return Math.round(pricingConfig.dailyRate * Math.max(days, 1));
    }
    return pricingConfig.dailyRate;
  }

  // Travel insurance: flat base rate
  if (pricingConfig.baseRate) {
    return Math.round(pricingConfig.baseRate);
  }

  // Vehicle insurance: percentage-based calculation
  let totalAssessedValue = insuredObject?.assessedValue || 0;

  // Parse assessed value from insuredObject fields
  if (!totalAssessedValue && insuredObject?.['Даатгалын үнэлгээ (₮)']) {
    const rawValue = insuredObject['Даатгалын үнэлгээ (₮)'];
    totalAssessedValue =
      typeof rawValue === 'string'
        ? parseFloat(rawValue.replace(/,/g, ''))
        : rawValue;
  }

  // Add trailer prices if they exist (for truck insurance)
  for (let i = 1; i <= 3; i++) {
    const trailerPrice = insuredObject?.[`Чиргүүл ${i} үнэ`];
    if (trailerPrice) {
      const numValue =
        typeof trailerPrice === 'string'
          ? parseFloat(trailerPrice.replace(/,/g, ''))
          : trailerPrice;
      totalAssessedValue += numValue || 0;
    }
  }

  // Percentage by duration (e.g., { "4months": 0.33, "12months": 1, "24months": 2 })
  if (pricingConfig.percentageByDuration && insuredObject?.duration) {
    const durationKey = `${insuredObject.duration}months`;
    const percentage = pricingConfig.percentageByDuration[durationKey];
    if (percentage) {
      return Math.round(totalAssessedValue * (percentage / 100));
    }
  }

  const percentage = pricingConfig.percentage || 3;
  return Math.round(totalAssessedValue * (percentage / 100));
}
