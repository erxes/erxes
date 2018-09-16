import gql from 'graphql-tag';
import { Alert } from 'modules/common/utils';
import { BasicInfoSection } from 'modules/customers/components/common';
import { mutations } from 'modules/customers/graphql';
import { ICustomer } from 'modules/customers/types';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';

type Props = {
  customersRemove: (doc: {
    variables: {
      customerIds: string[]
    }
  }) => Promise<any>,
  customersMerge: (doc: {
    variables: {
      customerIds: string[]
      customerFields: ICustomer
    }
  }) => Promise<any>,
  history: any,
  location: any
};

const BasicInfoContainer = (props: BaseProps & Props) => {
  const { customer, customersRemove, customersMerge, history } = props;

  const { _id } = customer;

  const remove = () => {
    customersRemove({
      variables: { customerIds: [_id] }
    })
      .then(() => {
        Alert.success('Success');
        history.push('/customers');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const merge = ({ ids, data }) => {
    customersMerge({
      variables: {
        customerIds: ids,
        customerFields: data
      }
    })
      .then(response => {
        Alert.success('Success');
        history.push(`/customers/details/${response.data.customersMerge._id}`);
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const updatedProps = {
    ...props,
    remove,
    merge
  };

  return <BasicInfoSection {...updatedProps} />;
};

const generateOptions = () => ({
  refetchQueries: ['customersMain', 'customerCounts']
});

type BaseProps = {
  customer: ICustomer,
  history: any,
  location: any,
  match: any,
};

export default withRouter<BaseProps>(
  compose(
    // mutations
    graphql(gql(mutations.customersRemove), {
      name: 'customersRemove',
      options: generateOptions()
    }),
    graphql(gql(mutations.customersMerge), {
      name: 'customersMerge',
      options: generateOptions()
    })
  )(BasicInfoContainer)
);
