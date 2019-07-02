import gql from 'graphql-tag';
import { Alert, withProps } from 'modules/common/utils';
import { mutations as customerMutations } from 'modules/customers/graphql';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import { ICustomer } from '../../customers/types';
import { CompanySection } from '../components';
import {
  CustomersEditCompaniesMutationResponse,
  CustomersEditCompaniesMutationVariables
} from '../types';

type Props = {
  data: ICustomer;
  isOpen?: boolean;
};

type FinalProps = Props & CustomersEditCompaniesMutationResponse;

const CompanyAssociate = (props: FinalProps) => {
  const { customersEditCompanies, data } = props;
  const save = companies => {
    customersEditCompanies({
      variables: {
        _id: data._id,
        companyIds: companies.map(company => company._id)
      }
    })
      .then(() => {
        Alert.success('You successfully updated a company list');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const extendedProps = {
    ...props,
    name: data.firstName,
    companies: data.companies,
    onSelect: companies => save(companies)
  };

  return <CompanySection {...extendedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<
      {},
      CustomersEditCompaniesMutationResponse,
      CustomersEditCompaniesMutationVariables
    >(gql(customerMutations.customersEditCompanies), {
      name: 'customersEditCompanies',
      options: () => ({
        refetchQueries: ['customerDetail']
      })
    })
  )(CompanyAssociate)
);
