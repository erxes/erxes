import { Button, Label, __ } from '@erxes/ui/src';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PosOrdersBySub } from '../types';
import * as moment from 'moment';

type Props = {
  item: PosOrdersBySub;
};

const Row = ({ item }: Props) => {
  const navigate = useNavigate();
  const { customer, customerType, status, closeDate } = item;

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
      return customer.primaryName;
    }
    if (customerType === 'user') {
      return customer?.details ? customer?.details?.fullName : 'Unknown';
    }
    if (!!item._id) {
      return `${customer?.firstName ?? ''} ${customer?.middleName ?? ''} ${customer?.lastName ?? ''}`;
    }
    return '-';
  };

  const generateEmaill = () => {
    if (customerType === 'compnay') {
      return customer.primaryEmail ?? 'Unknown';
    }
    if (customerType === 'user') {
      return customer?.email ?? 'Unknown';
    }

    if (!!item._id) {
      return customer?.primaryEmail ?? 'Unknown';
    }

    return '-';
  };

  const generrateLabelStyle = (): string => {
    switch (status) {
      case 'active':
        return 'success';
      case 'done':
        return 'simple';
      case 'cancelled':
        return 'danger';

      default:
        return 'default';
    }
  };

  const onClick = () => {
    let params = `customerId=${item.customerId}`;

    if (customerType === 'user') {
      params = `userId=${item.customerId}`;
    }

    navigate(`/pos-orders?${params}`);
  };

  return (
    <tr>
      <td>{generateType()}</td>
      <td>{generateName()}</td>
      <td>{generateEmaill()}</td>
      <td>
        <Label lblStyle={generrateLabelStyle()}>{status || ''}</Label>
      </td>
      <td>{closeDate ? moment(closeDate).format('YYYY-MM-DD HH:mm') : '-'}</td>
      <td>
        <Button btnStyle="simple" onClick={onClick}>
          {__('See Orders')}
        </Button>
      </td>
    </tr>
  );
};

export default Row;
