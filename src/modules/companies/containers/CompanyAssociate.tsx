import gql from 'graphql-tag';
import { Alert } from 'modules/common/utils';
import { mutations as customerMutations } from 'modules/customers/graphql';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { CompanySection } from '../components';

type Props = {
  customersEditCompanies: (params: {
    variables: {
      _id: string;
      companyIds: string[];
    }
  }) => Promise<any>;
  data: any;
};

const CompanyAssociate = (props: Props) => {
  const { customersEditCompanies, data } = props;

  const save = companies => {
    customersEditCompanies({
      variables: {
        _id: data._id,
        companyIds: companies.map(company => company._id)
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
    name: data.name,
    companies: data.companies,
    onSelect: companies => save(companies)
  };

  return <CompanySection {...extendedProps} />;
};

export default compose(
  graphql(gql(customerMutations.customersEditCompanies), {
    name: 'customersEditCompanies',
    options: () => ({
      refetchQueries: ['customerDetail']
    })
  })
)(CompanyAssociate);
