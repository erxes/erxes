import GetConformity from 'modules/conformity/containers/GetConformity';
import React from 'react';
import { queries } from '../../graphql';
import { ICustomer } from '../../types';
import CustomersSection from './CustomersSection';

type IProps = {
  mainType?: string;
  mainTypeId?: string;
  isOpen?: boolean;
  onSelect?: (datas: ICustomer[]) => void;
};

export default (props: IProps) => {
  return (
    <GetConformity
      {...props}
      relType="customer"
      component={CustomersSection}
      queryName="customers"
      itemsQuery={queries.customers}
    />
  );
};
