import * as React from 'react';
import { IProductCategory } from '../types';

type Props = {
  category: IProductCategory;
  onClick: (block: any) => void;
};

function Block({ category, onClick }: Props) {
  const handleOnClick = () => {
    onClick(category);
  };
  return <button onClick={handleOnClick}>{category.name}</button>;
}

export default Block;
