import gql from 'graphql-tag';
import { Alert } from 'modules/common/utils';
import { mutations as companyMutations } from 'modules/companies/graphql';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import { CustomerSection } from '../components/common';

type Props = {
  companiesEditCustomers: (doc: {
    variables: {
      _id: string,
      customerIds: string[]
    }
  }) => Promise<any>,
  company: any,
};

const CustomerAssociate = (props: Props) => {
  const { companiesEditCustomers, company } = props;

  const save = customers => {
    companiesEditCustomers({
      variables: {
        _id: company._id,
        customerIds: customers.map(customer => customer['_id'])
      }
    })
      .then(() => {
        Alert.success('Successfully saved');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const extendedProps = {
    ...props,
    name: company.name,
    customers: company.customers,
    onSelect: customers => save(customers)
  };

  return <CustomerSection {...extendedProps} />;
};

export default compose(
  graphql(gql(companyMutations.companiesEditCustomers), {
    name: 'companiesEditCustomers',
    options: () => ({
      refetchQueries: ['companyDetail']
    })
  })
)(CustomerAssociate);