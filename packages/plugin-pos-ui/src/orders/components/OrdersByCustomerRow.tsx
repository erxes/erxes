import React from 'react';
import { OrdersByCustomer } from '../types';
import { Button, __ } from '@erxes/ui/src';
import { useNavigate } from 'react-router-dom';

type Props = {
  item: OrdersByCustomer;
};

const Row = ({ item }: Props) => {
  const navigate = useNavigate();
  const { customerDetail, customerType, totalOrders, totalAmount } = item;

  const generateType = () => {
    if (customerType) {
      return customerType;
    }

    if (item._id && !customerType) {
      return 'customer';
    }

    return '-';
  };

  const generateName = () => {
    if (customerType === 'company') {
      return customerDetail.primaryName;
    }
    if (customerType === 'user') {
      return customerDetail?.details
        ? customerDetail?.details?.fullName
        : 'Unknown';
    }
    if (!!item._id) {
      return `${customerDetail?.firstName ?? ''} ${customerDetail?.middleName ?? ''} ${customerDetail?.lastName ?? ''}`;
    }
    return '-';
  };

  const generateEmaill = () => {
    if (customerType === 'compnay') {
      return customerDetail.primaryEmail ?? 'Unknown';
    }
    if (customerType === 'user') {
      return customerDetail?.email ?? 'Unknown';
    }

    if (!!item._id) {
      return customerDetail?.primaryEmail ?? 'Unknown';
    }

    return '-';
  };

  const onClick = () => {
    let params = `customerId=${item._id}`;

    if (customerType === 'user') {
      params = `userId=${item._id}`;
    }

    navigate(`/pos-orders?${params}`);
  };

  return (
    <tr>
      <td>{generateType()}</td>
      <td>{generateName()}</td>
      <td>{generateEmaill()}</td>
      <td>{totalOrders || 0}</td>
      <td>{totalAmount || 0}</td>
      <td>
        <Button btnStyle="simple" onClick={onClick}>
          {__('See Orders')}
        </Button>
      </td>
    </tr>
  );
};

export default Row;
