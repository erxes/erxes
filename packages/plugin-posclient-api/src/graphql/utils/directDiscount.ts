import { IConfigDocument } from '../../models/definitions/configs';
import { IPosUserDocument } from '../../models/definitions/posUsers';
import { IOrderInput } from '../types';

export const checkDirectDiscount = (
  orderInput: IOrderInput,
  config: IConfigDocument,
  posUser: IPosUserDocument
): IOrderInput => {
  const { directDiscount, items } = orderInput;
  const { adminIds, cashierIds, permissionConfig } = config;

  if (
    !directDiscount ||
    !posUser ||
    !isAuthorizedUser(posUser._id, adminIds, cashierIds)
  ) {
    return orderInput;
  }

  const isAdmin = adminIds.includes(posUser._id);
  const limit =
    permissionConfig[isAdmin ? 'admins' : 'cashiers'].directDiscountAmount;

  if (directDiscount > limit) {
    throw new Error(
      `Direct discount limit of ${isAdmin ? 'admins' : 'cashiers'} exceeded`
    );
  }

  applyDiscount(items, directDiscount);

  return orderInput;
};

const isAuthorizedUser = (
  userId: string,
  adminIds: string[],
  cashierIds: string[]
): boolean => {
  return cashierIds.concat(adminIds).includes(userId);
};

const applyDiscount = (
  items: IOrderInput['items'],
  directDiscount: number
): void => {
  for (const item of items || []) {
    const discountValue = calculateDiscount(item.unitPrice, directDiscount);
    item.unitPrice -= discountValue;
    item.discountAmount = discountValue * item.count;
  }
};

const calculateDiscount = (
  unitPrice: number,
  directDiscount: number
): number => {
  return parseFloat(((unitPrice * directDiscount) / 100).toFixed(2));
};
