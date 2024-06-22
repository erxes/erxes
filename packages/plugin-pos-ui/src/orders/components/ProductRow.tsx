import React from 'react';
import { IPosProduct } from '../types';

type Props = {
  product: IPosProduct;
};

const hours = [
  ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
  ['10'],
  ['11'],
  ['12'],
  ['13'],
  ['14'],
  ['15'],
  ['16'],
  ['17'],
  ['18'],
  ['19'],
  ['20'],
  ['21', '22', '23', '24'],
];

const ProductRow = (props: Props) => {
  const { product } = props;
  const { code, name, category, unitPrice, counts, count, amount } = product;

  const renderHour = (counts, keys) => {
    const items = Object.keys(counts).filter((c) => keys.includes(c));
    if (!items || !items.length) {
      return <td key={Math.random()}></td>;
    }

    return (
      <td key={Math.random()}>
        {items.map((k) => counts[k]).reduce((a, b) => a + b)}
      </td>
    );
  };

  return (
    <tr>
      <td>{code}</td>
      <td>{name}</td>
      <td>{category ? category.name : ''}</td>
      <td>{(unitPrice || 0).toLocaleString()}</td>
      {hours.map((keys) => renderHour(counts, keys))}
      <td>{(count || 0).toLocaleString()}</td>
      <td>{(amount || 0).toLocaleString()}</td>
    </tr>
  );
};

export default ProductRow;
