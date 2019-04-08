import gql from 'graphql-tag';
import { Alert, withProps } from 'modules/common/utils';
import {
  AddMutationResponse,
  EditMutationResponse,
  ICustomer,
  ICustomerDoc
} from 'modules/customers/types';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { CustomerForm } from '../components';
import { mutations } from '../graphql';

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
        Alert.success('You successfully added a customer');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  if (customer) {
    action = ({ doc }) => {
      customersEdit({ variables: { _id: customer._id, ...doc } })
        .then(() => {
          Alert.success('You successfully updated a customer');
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
    graphql<Props, EditMutationResponse, ICustomer>(
      gql(mutations.customersEdit),
      {
        name: 'customersEdit',
        options
      }
    ),
    graphql<Props, AddMutationResponse, ICustomerDoc>(
      gql(mutations.customersAdd),
      {
        name: 'customersAdd',
        options
      }
    )
  )(CustomerFormContainer)
);
