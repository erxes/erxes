import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { __, Table } from '@erxes/ui/src';
import Row from '../containers/Row';
import { MONTH, DAYS } from '../../constants';

type Props = {
  timeframes: any[];
  products: any[];
  data: any;
  refetch: () => void;
};

const List = (props: Props) => {
  const { timeframes = [], products = [], data = {}, refetch } = props;

  const renderTimeframesHeader = () => {
    if (!timeframes) return null;

    switch (data && data.type) {
      case 'Year':
        return MONTH.map((item: any, index: number) => {
          return <th key={`timeframeYear-${index}`}>{item.label}</th>;
        });
      case 'Month':
        return DAYS.map((item: any, index: number) => {
          return <th key={`timeframeMonth-${index}`}>{item.label}</th>;
        });
      case 'Day':
        return timeframes.map((item: any, index: number) => {
          return <th key={`timeframeDay-${index}`}>{item.name}</th>;
        });
      default:
        return null;
    }
  };

  const renderActionsHeader = () => {
    if (data && ['pending', 'published'].includes(data.status)) return null;

    return <th>Actions</th>;
  };

  const renderProducts = () => {
    if (!products) return null;

    return products.map((product: any, index: number) => {
      const salesProducts = data.products ? data.products : [];
      const salesProductIndex = _.findIndex(salesProducts, {
        productId: product._id
      });
      const salesProduct = salesProducts[salesProductIndex]
        ? salesProducts[salesProductIndex]
        : [];

      return (
        <Row
          key={index}
          product={product}
          productSales={salesProduct}
          status={data.status ? data.status : ''}
          type={data.type ? data.type : ''}
          timeframes={timeframes}
          refetch={refetch}
        />
      );
    });
  };

  return (
    <Table condensed={true}>
      <thead>
        <tr>
          <th>Name</th>
          {renderTimeframesHeader()}
          {renderActionsHeader()}
        </tr>
      </thead>
      <tbody>{renderProducts()}</tbody>
    </Table>
  );
};

export default List;
