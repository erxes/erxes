import { generateCategoryOptions } from '@erxes/ui/src/utils';
import {
  PRODUCT_TYPE_CHOISES,
  PRODUCT_CATEGORIES_STATUS_FILTER
} from './constants';

export { generateCategoryOptions };

export const productTypeChoises = __ => {
  const options: Array<{ value: string; label: string }> = [];

  for (const key of Object.keys(PRODUCT_TYPE_CHOISES)) {
    options.push({
      value: key,
      label: __(PRODUCT_TYPE_CHOISES[key])
    });
  }

  return options;
};

export const categoryStatusChoises = __ => {
  const options: Array<{ value: string; label: string }> = [];

  for (const key of Object.keys(PRODUCT_CATEGORIES_STATUS_FILTER)) {
    options.push({
      value: key,
      label: __(PRODUCT_CATEGORIES_STATUS_FILTER[key])
    });
  }

  return options;
};

export const isValidBarcode = (barcode: string): boolean => {
  // check length
  if (
    barcode.length < 8 ||
    barcode.length > 18 ||
    (barcode.length != 8 &&
      barcode.length != 12 &&
      barcode.length != 13 &&
      barcode.length != 14 &&
      barcode.length != 18)
  ) {
    return false;
  }

  const lastDigit = Number(barcode.substring(barcode.length - 1));
  let checkSum = 0;
  if (isNaN(lastDigit)) {
    return false;
  } // not a valid upc/ean

  const arr: any = barcode
    .substring(0, barcode.length - 1)
    .split('')
    .reverse();
  let oddTotal = 0,
    evenTotal = 0;

  for (var i = 0; i < arr.length; i++) {
    if (isNaN(arr[i])) {
      return false;
    } // can't be a valid upc/ean we're checking for

    if (i % 2 == 0) {
      oddTotal += Number(arr[i]) * 3;
    } else {
      evenTotal += Number(arr[i]);
    }
  }
  checkSum = (10 - ((evenTotal + oddTotal) % 10)) % 10;

  // true if they are equal
  return checkSum == lastDigit;
};
