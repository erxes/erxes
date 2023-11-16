import React, { useEffect } from 'react';

import { queries } from '../graphql';
import { gql, useLazyQuery } from '@apollo/client';

import { Spinner } from '@erxes/ui/src/components';
import Contact from '../components/Contact';

const ContactsContainer = () => {
  let customers;

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
        sortDirection: -1
      }
    });
  };

  customers = data?.data?.customers;

  return (
    <Contact
      history={history}
      customers={customers}
      searchCustomer={searchCustomer}
    />
  );
};

export default ContactsContainer;
