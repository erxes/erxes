import { ITour } from '@/bms/@types/tour';
import {
  IOrderPackageSnapshot,
  IOrderPeople,
  IOrderPrepaid,
  IOrderPricingSnapshot,
} from '@/bms/@types/order';

export interface PricingInput {
  packageId: string;
  people: IOrderPeople;
  singleSupplement?: boolean;
  includeDomesticFlight?: boolean;
}

export interface ComputedPricing {
  package: IOrderPackageSnapshot;
  pricing: IOrderPricingSnapshot;
  prepaid: IOrderPrepaid;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function computeOrderPricing(
  tour: ITour,
  input: PricingInput,
): ComputedPricing {
  const option = (tour.pricingOptions ?? []).find(
    (o) => o._id === input.packageId,
  );

  if (!option) {
    throw new Error(
      `Pricing package "${input.packageId}" not found on this tour`,
    );
  }

  const totalPeople =
    input.people.adults + input.people.children + input.people.infants;

  if (totalPeople < option.minPersons) {
    throw new Error(
      `Package "${option.title}" requires at least ${option.minPersons} persons`,
    );
  }

  if (option.maxPersons != null && totalPeople > option.maxPersons) {
    throw new Error(
      `Package "${option.title}" allows at most ${option.maxPersons} persons`,
    );
  }

  // Build price map from the prices array (adult/child/infant per type)
  const priceMap: Record<string, number> = {};
  for (const p of option.prices ?? []) {
    priceMap[p.type] = p.price;
  }

  const adultPrice = priceMap['adult'] ?? option.pricePerPerson ?? 0;
  const childPrice = priceMap['child'] ?? 0;
  const infantPrice = priceMap['infant'] ?? 0;

  const perPersonFlight =
    input.includeDomesticFlight ? (option.domesticFlightPerPerson ?? 0) : 0;
  const singleSupplementAmount =
    input.singleSupplement ? (option.singleSupplement ?? 0) : 0;

  const subtotal = round2(
    input.people.adults * adultPrice +
      input.people.children * childPrice +
      input.people.infants * infantPrice,
  );

  const totalAmount = round2(
    subtotal + singleSupplementAmount + totalPeople * perPersonFlight,
  );

  // Prepaid uses advanceCheck + advancePercent from the tour
  const prepaidEnabled = !!(tour.advanceCheck && tour.advancePercent);
  const prepaidPercent = prepaidEnabled ? (tour.advancePercent ?? 0) : 0;
  const prepaidAmount = prepaidEnabled
    ? round2((totalAmount * prepaidPercent) / 100)
    : 0;

  return {
    package: {
      packageId: option._id,
      title: option.title,
      minPersons: option.minPersons,
      maxPersons: option.maxPersons,
      accommodationType: option.accommodationType,
    },
    pricing: {
      adultPrice,
      childPrice,
      infantPrice,
      domesticFlight: option.domesticFlightPerPerson ?? 0,
      singleSupplement: option.singleSupplement ?? 0,
      subtotal,
      totalAmount,
    },
    prepaid: {
      enabled: prepaidEnabled,
      percent: prepaidPercent,
      amount: prepaidAmount,
      remainingAmount: round2(totalAmount - prepaidAmount),
    },
  };
}
