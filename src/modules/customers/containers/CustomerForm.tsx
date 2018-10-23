import gql from 'graphql-tag';
import { Alert, withProps } from 'modules/common/utils';
import { ICustomer, ICustomerDoc } from 'modules/customers/types';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { CustomerForm } from '../components';
import { mutations } from '../graphql';

type EditMutationResponse = {
  customersEdit: (params: { variables: ICustomer }) => Promise<any>;
};

type AddMutationResponse = {
  customersAdd: (params: { variables: ICustomerDoc }) => Promise<any>;
};

type Props = {
  customer: ICustomer;
  closeModal: () => void;
};

type FinalProps = Props & EditMutationResponse & AddMutationResponse;

const CustomerFormContainer = (props: FinalProps) => {
  const { customersEdit, customer, customersAdd } = props;

  let action = ({ doc }) => {
    customersAdd({ variables: doc })
      .then(() => {
        Alert.success('Success');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  if (customer) {
    action = ({ doc }) => {
      customersEdit({ variables: { _id: customer._id, ...doc } })
        .then(() => {
          Alert.success('Success');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };
  }

  const updatedProps = {
    ...props,
    action
  };

  return <CustomerForm {...updatedProps} />;
};

const options = () => {
  return {
    refetchQueries: [
      'customersMain',
      // customers for company detail associate customers
      'customers',
      'customerCounts'
    ]
  };
};

export default withProps<Props>(
  compose(
    graphql<{}, EditMutationResponse, ICustomer>(gql(mutations.customersEdit), {
      name: 'customersEdit',
      options
    }),
    graphql<{}, AddMutationResponse, ICustomerDoc>(
      gql(mutations.customersAdd),
      {
        name: 'customersAdd',
        options
      }
    )
  )(CustomerFormContainer)
);
