import { IPricingOption, PassengerType } from '@/bms/@types/tour';

export type PassengerCounts = Partial<Record<PassengerType, number>>;

const normalizePassengerType = (type: string) => type.trim().toLowerCase();

export const getPassengerPrice = (
  pricingOption: IPricingOption,
  passengerType: PassengerType,
): number | undefined => {
  const type = normalizePassengerType(String(passengerType));
  const price = pricingOption.prices?.find(
    (item) => normalizePassengerType(String(item.type)) === type,
  );

  if (price) {
    return price.price;
  }

  if (type === 'adult') {
    return pricingOption.pricePerPerson;
  }

  return undefined;
};

export const calculateTourBookingTotal = ({
  pricingOption,
  passengerCounts,
  includeDomesticFlight = true,
  singleSupplementCount = 0,
}: {
  pricingOption: IPricingOption;
  passengerCounts: PassengerCounts;
  includeDomesticFlight?: boolean;
  singleSupplementCount?: number;
}): number => {
  const passengerTotal = Object.entries(passengerCounts).reduce(
    (total, [type, rawCount]) => {
      const count = Math.max(0, Number(rawCount || 0));
      if (!count) return total;

      const price = getPassengerPrice(pricingOption, type);
      if (typeof price !== 'number') {
        throw new Error(`Missing price for passenger type "${type}"`);
      }

      return total + price * count;
    },
    0,
  );

  const passengerCount = Object.values(passengerCounts).reduce<number>(
    (total, rawCount) => total + Math.max(0, Number(rawCount || 0)),
    0,
  );

  const domesticFlightTotal =
    includeDomesticFlight &&
    typeof pricingOption.domesticFlightPerPerson === 'number'
      ? pricingOption.domesticFlightPerPerson * passengerCount
      : 0;

  const singleSupplementTotal =
    typeof pricingOption.singleSupplement === 'number'
      ? pricingOption.singleSupplement * Math.max(0, singleSupplementCount)
      : 0;

  return passengerTotal + domesticFlightTotal + singleSupplementTotal;
};
