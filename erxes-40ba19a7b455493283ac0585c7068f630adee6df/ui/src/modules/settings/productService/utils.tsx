import React from 'react';
import { PRODUCT_TYPE_CHOISES } from './constants';
import { IProductCategory } from './types';

export const generateCategoryOptions = (
  categories: IProductCategory[],
  currentCategoryId?: string
) => {
  const result: React.ReactNode[] = [];

  for (const category of categories) {
    const order = category.order;

    const foundedString = order.match(/[/]/gi);

    let space = '';

    if (foundedString) {
      space = '\u00A0 '.repeat(foundedString.length);
    }

    if (currentCategoryId !== category._id) {
      result.push(
        <option key={category._id} value={category._id}>
          {space}
          {category.name}
        </option>
      );
    }
  }

  return result;
};

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
