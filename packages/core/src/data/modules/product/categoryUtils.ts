/**
 * ProductCategories parent/child relationship is saved in its
 * "order" field for easy traversal. As long as this logic remains,
 * the following util functions will be operational.
 */

import { IProductCategory } from "../../../db/models/definitions/products";

const isEmpty = val => val === null || val === undefined || val === "";

export const hasChildren = (code: string, order: string = ''): boolean => {
  const codes = order.split('/').filter(el => !isEmpty(el));

  return codes.length > 0 && order.includes(code);
};

/**
 * Checks whether child is a descendant of parent or not 
 */
export const isDescendantOf = (child: IProductCategory, parent: IProductCategory): boolean => {
  const { code: childCode } = child;
  const { code: parentCode, order: parentOrder } = parent;

  if (childCode && parentCode && (childCode === parentCode)) {
    return false;
  }

  const codes = parentOrder.split('/').filter(el => !isEmpty(el));
  const childIndex = codes.findIndex(c => c === childCode);

  // parent itself has no children or child not found
  if (codes.length === 1 || childIndex === -1) {
    return false;
  }

  const parentIndex = codes.findIndex(p => p === parentCode);

  return parentIndex > childIndex;
};
