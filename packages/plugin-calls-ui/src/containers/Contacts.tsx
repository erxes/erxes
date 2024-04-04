import React, { useEffect } from 'react';

import { queries } from '../graphql';
import { gql, useLazyQuery } from '@apollo/client';

import Contact from '../components/Contact';

type Props = {
  changeMainTab: (phoneNumber: string, shiftTab: string) => void;
};
const ContactsContainer = (props: Props) => {
  let customers;
  const { changeMainTab } = props;

  useEffect(() => {
    searchCustomer('');
  }, []);

  const [getCustomers, data] = useLazyQuery(gql(queries.customers));

  const searchCustomer = (searchValue?: string) => {
    getCustomers({
      variables: {
        searchValue: searchValue || '',
        type: 'lead',
        sortField: 'createdAt',
        sortDirection: -1,
      },
    });
  };

  customers = data?.data?.customers;

  return (
    <Contact
      history={history}
      customers={customers}
      searchCustomer={searchCustomer}
      changeMainTab={changeMainTab}
    />
  );
};

export default ContactsContainer;
