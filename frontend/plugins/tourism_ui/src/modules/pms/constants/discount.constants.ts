/**
 * A discount row targets one product group of the branch, mirroring the groups
 * configured in the pipeline config step.
 */
export const PMS_DISCOUNT_TYPES = {
  ROOMS: 'rooms',
  EXTRA_PRODUCTS: 'extraProducts',
  APPOINTMENTS: 'appointments',
} as const;

export type PmsDiscountType =
  (typeof PMS_DISCOUNT_TYPES)[keyof typeof PMS_DISCOUNT_TYPES];

export const PMS_DISCOUNT_TYPE_OPTIONS: {
  value: PmsDiscountType;
  labelKey: string;
}[] = [
  { value: PMS_DISCOUNT_TYPES.ROOMS, labelKey: 'rooms' },
  { value: PMS_DISCOUNT_TYPES.EXTRA_PRODUCTS, labelKey: 'extra-products' },
  { value: PMS_DISCOUNT_TYPES.APPOINTMENTS, labelKey: 'appointments' },
];
