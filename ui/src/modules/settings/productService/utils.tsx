import React from 'react';
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
