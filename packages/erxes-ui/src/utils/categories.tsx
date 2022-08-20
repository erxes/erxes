import React from 'react';

export interface ICategory {
  _id: string;
  name: string;
  order: string;
  code: string;
  description?: string;
  parentId?: string;
  createdAt: Date;
  isRoot: boolean;
}

export const generateCategoryOptions = (
  categories: ICategory[],
  currentCategoryId?: string,
  drawCode?: boolean
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
          {drawCode ? `${category.code} - ` : ''}
          {category.name}
        </option>
      );
    }
  }

  return result;
};
