import gql from 'graphql-tag';
import { Alert, withProps } from 'modules/common/utils';
import { mutations as companyMutations } from 'modules/companies/graphql';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { ICompany } from '../../companies/types';
import { CustomerSection } from '../components/common';

type EditMutationVariables = {
  _id: string;
  customerIds: string[];
};

type EditMutationResponse = {
  companiesEditCustomers: (
    doc: {
      variables: EditMutationVariables;
    }
  ) => Promise<any>;
};

type Props = {
  data: ICompany;
};

type FinalProps = Props & EditMutationResponse;

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
        Alert.success('Successfully saved');
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
    graphql<{}, EditMutationResponse, EditMutationVariables>(
      gql(companyMutations.companiesEditCustomers),
      {
        name: 'companiesEditCustomers',
        options: () => ({
          refetchQueries: ['companyDetail']
        })
      }
    )
  )(CustomerAssociate)
);
