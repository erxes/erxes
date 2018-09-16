import gql from 'graphql-tag';
import { Alert } from 'modules/common/utils';
import { ICustomer, ICustomerDoc } from 'modules/customers/types';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { CustomerForm } from '../components';
import { mutations } from '../graphql';

type Props = {
  customer: ICustomer,
  closeModal: () => void,
  customersEdit: (params: { variables: ICustomer }) => Promise<any>,
  customersAdd: (params: { variables: ICustomerDoc }) => Promise<any>
};

const CustomerFormContainer = (props: Props) => {
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

export default compose(
  graphql(gql(mutations.customersEdit), {
    name: 'customersEdit',
    options
  }),
  graphql(gql(mutations.customersAdd), {
    name: 'customersAdd',
    options
  })
)(CustomerFormContainer);
