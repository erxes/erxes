import gql from 'graphql-tag';
import { Alert, withProps } from 'modules/common/utils';
import { mutations as customerMutations } from 'modules/customers/graphql';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { ICustomer } from '../../customers/types';
import { CompanySection } from '../components';

type EditMutationVariables = {
  _id: string;
  companyIds: string[];
};

type EditMutationResponse = {
  customersEditCompanies: (
    params: {
      variables: EditMutationVariables;
    }
  ) => Promise<any>;
};

type Props = {
  data: ICustomer;
  isOpen?: boolean;
};

type FinalProps = Props & EditMutationResponse;

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
        Alert.success('Successfully saved');
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
    graphql<{}, EditMutationResponse, EditMutationVariables>(
      gql(customerMutations.customersEditCompanies),
      {
        name: 'customersEditCompanies',
        options: () => ({
          refetchQueries: ['customerDetail']
        })
      }
    )
  )(CompanyAssociate)
);
