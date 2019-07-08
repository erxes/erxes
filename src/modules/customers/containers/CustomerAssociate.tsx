import gql from 'graphql-tag';
import { Alert, withProps } from 'modules/common/utils';
import { mutations as companyMutations } from 'modules/companies/graphql';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import { ICompany } from '../../companies/types';
import CustomerSection from '../components/common/CustomerSection';
import {
  CompaniesEditCustomersMutationResponse,
  CompaniesEditCustomersMutationVariables
} from '../types';

type Props = {
  data: ICompany;
};

type FinalProps = Props & CompaniesEditCustomersMutationResponse;

const CustomerAssociate = (props: FinalProps) => {
  const { companiesEditCustomers, data } = props;

  const save = customers => {
    companiesEditCustomers({
      variables: {
        _id: data._id,
        customerIds: customers.map(customer => customer._id)
      }
    })
      .then(() => {
        Alert.success('You successfully updated a customer list');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const extendedProps = {
    ...props,
    name: data.primaryName || '',
    customers: data.customers,
    onSelect: customers => save(customers)
  };

  return <CustomerSection {...extendedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<
      Props,
      CompaniesEditCustomersMutationResponse,
      CompaniesEditCustomersMutationVariables
    >(gql(companyMutations.companiesEditCustomers), {
      name: 'companiesEditCustomers',
      options: () => ({
        refetchQueries: ['companyDetail']
      })
    })
  )(CustomerAssociate)
);
