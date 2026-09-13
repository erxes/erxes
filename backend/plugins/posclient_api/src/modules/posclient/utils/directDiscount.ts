import { IConfigDocument } from '~/modules/posclient/@types/configs';
import { IPosUserDocument } from '~/modules/posclient/@types/posUsers';
import { IOrderInput } from '~/modules/posclient/@types/types';
import {
  applyDiscountInfo,
  getDiscountBaseAmount,
  getDiscountBaseUnitPrice,
} from './discountInfos';

export const checkDirectDiscount = (
  orderInput: IOrderInput,
  config: IConfigDocument,
  posUser: IPosUserDocument,
): IOrderInput => {
  const { directDiscount, directIsAmount, items } = orderInput;
  const { adminIds, cashierIds, permissionConfig } = config;
  const output = { ...orderInput, directDiscount: 0 };
  if (
    !directDiscount ||
    !posUser ||
    !isAuthorizedUser(posUser._id, adminIds, cashierIds)
  ) {
    return output;
  }

  const isAdmin = adminIds.includes(posUser._id);
  const staffConfig = permissionConfig[isAdmin ? 'admins' : 'cashiers'];

  if (!staffConfig?.directDiscount) return output;

  const limitPercent = Number.parseFloat(staffConfig?.directDiscountLimit);

  if (Number.isNaN(limitPercent)) return output;

  const totalAmount = (items || []).reduce(
    (sum, item) => sum + getDiscountBaseAmount(item),
    0,
  );

  if (
    (!directIsAmount && directDiscount > limitPercent) ||
    (directIsAmount && directDiscount > (totalAmount / 100) * limitPercent)
  ) {
    throw new Error(
      `Direct discount limit of ${isAdmin ? 'admins' : 'cashiers'} exceeded`,
    );
  }

  const discountPercent = directIsAmount
    ? (directDiscount * 100) / totalAmount
    : directDiscount;
  applyDiscount(items, discountPercent);

  return orderInput;
};

const isAuthorizedUser = (
  userId: string,
  adminIds: string[],
  cashierIds: string[],
): boolean => {
  return cashierIds.concat(adminIds).includes(userId);
};

const applyDiscount = (
  items: IOrderInput['items'],
  directDiscount: number,
): void => {
  for (const item of items || []) {
    item.unitPrice = item.unitPrice || 0;

    const baseUnitPrice = getDiscountBaseUnitPrice(item);
    const discountValue = Number.parseFloat(
      ((baseUnitPrice * directDiscount) / 100).toFixed(2),
    );
    applyDiscountInfo(item, {
      type: 'hand',
      title: 'Direct discount',
      amount: discountValue * item.count,
      percent: directDiscount,
    });
    item.unitPrice -= discountValue;
  }
};
