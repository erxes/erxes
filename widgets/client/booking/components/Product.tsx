import * as React from 'react';
import { IProduct } from '../types';

type Props = {
  product?: IProduct;
};

function Product({ product }: Props) {
  if (!product) {
    return null;
  }
  return (
    <div>
      <h1>{product.name}</h1>
    </div>
  );
}

export default Product;
