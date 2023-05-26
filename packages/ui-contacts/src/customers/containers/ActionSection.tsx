import client from '@erxes/ui/src/apolloClient';
import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { Alert, withProps } from '@erxes/ui/src/utils';
import ActionSection from '../components/common/ActionSection';
import { mutations, queries } from '../graphql';
import {
  ChangeStateMutationResponse,
  ChangeStateMutationVariables,
  ICustomer,
  MergeMutationResponse,
  MergeMutationVariables,
  RemoveMutationResponse,
  RemoveMutationVariables
} from '../types';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import { withRouter } from 'react-router-dom';
import { IRouterProps } from '@erxes/ui/src/types';

type Props = {
  customer: ICustomer;
  isSmall?: boolean;
};

type FinalProps = Props &
  RemoveMutationResponse &
  MergeMutationResponse &
  ChangeStateMutationResponse &
  IRouterProps;

const ActionSectionContainer = (props: FinalProps) => {
  const {
    isSmall,
    customer,
    customersRemove,
    customersMerge,
    customersChangeState,
    history
  } = props;

  const { _id } = customer;

  const remove = () => {
    customersRemove({
      variables: { customerIds: [_id] }
    })
      .then(() => {
        Alert.success('You successfully deleted a customer');
        history.push('/contacts/customer');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const changeState = (value: string) => {
    customersChangeState({
      variables: {
        _id,
        value
      }
    })
      .then(() => {
        Alert.success('You successfully changed the state');
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
        history.push(`/contacts/details/${response.data.customersMerge._id}`);
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
    changeState,
    search: searchCustomer
  };

  return <ActionSection {...updatedProps} />;
};

const generateOptions = () => ({
  refetchQueries: ['customersMain', 'customerCounts', 'customerDetail']
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
    ),
    graphql<Props, ChangeStateMutationResponse, ChangeStateMutationVariables>(
      gql(mutations.customersChangeState),
      {
        name: 'customersChangeState',
        options: generateOptions()
      }
    )
  )(withRouter<FinalProps>(ActionSectionContainer))
);
