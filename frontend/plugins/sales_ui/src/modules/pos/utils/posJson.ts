import { z } from 'zod';
import type { SalesPosSettingsDetailQuery } from '~/gql/graphql';
import { isDefined } from 'erxes-ui';

export const hasId = <T extends { _id?: string | null }>(
  value: T | null | undefined,
): value is T & { _id: string } => typeof value?._id === 'string';

const text = z.string().nullish();
const flag = z.boolean().nullish();
const number = z.number().nullish();
const ids = z.array(z.string().nullable()).nullish();

// POS configuration remains JSON in the public API. Validate the fields the UI
// reads and retain extension keys when an editor spreads the saved configuration.
export const posUiOptionsSchema = z
  .object({
    logo: text,
    bgImage: text,
    favIcon: text,
    receiptIcon: text,
    kioskHeaderImage: text,
    mobileAppImage: text,
    qrCodeImage: text,
    colors: z
      .object({ bodyColor: text, headerColor: text, footerColor: text })
      .passthrough()
      .nullish(),
    texts: z.object({ website: text, phone: text }).passthrough().nullish(),
  })
  .passthrough();
const screenSchema = z
  .object({
    isActive: flag,
    isPrint: flag,
    type: text,
    showType: text,
    contentUrl: text,
    // Older configurations store the timer as a number; current forms use text.
    value: z.union([z.string(), z.number()]).nullish(),
  })
  .passthrough();
const deliverySchema = z
  .object({
    boardId: text,
    pipelineId: text,
    stageId: text,
    productId: text,
    mapCustomField: text,
    watchedUserIds: ids,
    assignedUserIds: ids,
  })
  .passthrough();
const cardSchema = z
  .object({
    branchId: text,
    boardId: text,
    pipelineId: text,
    stageId: text,
    assignedUserIds: ids,
    deliveryMapField: text,
    title: text,
  })
  .passthrough();
const permissionSchema = z
  .object({
    isTempBill: flag,
    directDiscount: flag,
    directDiscountLimit: number,
    seeReport: flag,
    createCustomer: flag,
  })
  .passthrough();
const tierSchema = z
  .object({
    accountTypeId: text,
    bands: z
      .array(
        z.object({ tier: z.string(), min: number, max: number }).passthrough(),
      )
      .nullish(),
    onlyUpgrade: flag,
  })
  .passthrough();
export const posPaymentTypesSchema = z.array(
  z
    .object({
      _id: text,
      type: text,
      title: text,
      icon: text,
      config: z.unknown(),
      scoreCampaignId: text,
    })
    .passthrough()
    .nullable(),
);

export const toPosDetail = (
  pos: NonNullable<SalesPosSettingsDetailQuery['posDetail']>,
) => ({
  ...pos,
  uiOptions: posUiOptionsSchema.nullish().parse(pos.uiOptions),
  kitchenScreen: screenSchema.nullish().parse(pos.kitchenScreen),
  waitingScreen: screenSchema.nullish().parse(pos.waitingScreen),
  deliveryConfig: deliverySchema.nullish().parse(pos.deliveryConfig),
  cardsConfig: z.record(cardSchema).nullish().parse(pos.cardsConfig),
  permissionConfig: z
    .object({
      admins: permissionSchema.nullish(),
      cashiers: permissionSchema.nullish(),
    })
    .passthrough()
    .nullish()
    .parse(pos.permissionConfig),
  earnTier: tierSchema.nullish().parse(pos.earnTier),
  paymentTypes: posPaymentTypesSchema
    .parse(pos.paymentTypes ?? [])
    .filter(isDefined),
  customerCreateConfig: z
    .object({
      enabled: flag,
      assignCashierAsOwner: flag,
      layout: z.array(z.array(z.string())).nullish(),
    })
    .passthrough()
    .nullish()
    .parse(pos.customerCreateConfig),
});

// Controlled inputs display null as empty text; keep that stored value when the
// user edits another field, and preserve opaque JSON configs until edited.
export const restorePosPaymentText = (
  edited: string | undefined,
  original: string | null | undefined,
) =>
  (original == null && edited === (original ?? '')) ||
  (original === null && edited === undefined)
    ? original
    : edited;

export const restorePosPaymentConfig = (
  edited: string | undefined,
  original: unknown,
): unknown => {
  if (original === null && edited === undefined) return null;
  return original != null &&
    typeof original !== 'string' &&
    JSON.stringify(original) === edited
    ? original
    : edited;
};
