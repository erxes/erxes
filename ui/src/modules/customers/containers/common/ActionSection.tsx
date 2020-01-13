import client from 'apolloClient';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { Alert, withProps } from 'modules/common/utils';
import ActionSection from 'modules/customers/components/common/ActionSection';
import { mutations, queries } from 'modules/customers/graphql';
import {
  ICustomer,
  MergeMutationResponse,
  MergeMutationVariables,
  RemoveMutationResponse,
  RemoveMutationVariables
} from 'modules/customers/types';
import React from 'react';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import { IRouterProps } from '../../../common/types';

type Props = {
  customer: ICustomer;
  isSmall?: boolean;
};

type FinalProps = Props &
  RemoveMutationResponse &
  MergeMutationResponse &
  IRouterProps;

const ActionSectionContainer = (props: FinalProps) => {
  const { isSmall, customer, customersRemove, customersMerge, history } = props;

  const { _id } = customer;

  const remove = () => {
    customersRemove({
      variables: { customerIds: [_id] }
    })
      .then(() => {
        Alert.success('You successfully deleted a customer');
        history.push('/contacts/customers/all');
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
        Alert.success('You successfully merged a customer');
        history.push(
          `/contacts/customers/details/${response.data.customersMerge._id}`
        );
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const searchCustomer = (
    searchValue: string,
    callback: (data?: any) => void
  ) => {
    client
      .query({
        query: gql(queries.customers),
        variables: { searchValue, page: 1, perPage: 10 }
      })
      .then((response: any) => {
        if (typeof callback === 'function') {
          callback(response.data.customers);
        }
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  const updatedProps = {
    isSmall,
    coc: customer,
    cocType: 'customer',
    remove,
    merge,
    search: searchCustomer
  };

  return <ActionSection {...updatedProps} />;
};

const generateOptions = () => ({
  refetchQueries: ['customersMain', 'customerCounts']
});

export default withProps<Props>(
  compose(
    // mutations
    graphql<Props, RemoveMutationResponse, RemoveMutationVariables>(
      gql(mutations.customersRemove),
      {
        name: 'customersRemove',
        options: generateOptions()
      }
    ),
    graphql<Props, MergeMutationResponse, MergeMutationVariables>(
      gql(mutations.customersMerge),
      {
        name: 'customersMerge',
        options: generateOptions()
      }
    )
  )(withRouter<FinalProps>(ActionSectionContainer))
);
