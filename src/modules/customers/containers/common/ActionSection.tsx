import gql from 'graphql-tag';
import { Alert, withProps } from 'modules/common/utils';
import { ActionSection } from 'modules/customers/components/common';
import { mutations } from 'modules/customers/graphql';
import {
  ICustomer,
  MergeMutationResponse,
  MergeMutationVariables,
  RemoveMutationResponse,
  RemoveMutationVariables
} from 'modules/customers/types';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
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
  const { customer, customersRemove, customersMerge, history } = props;

  const { _id } = customer;

  const remove = () => {
    customersRemove({
      variables: { customerIds: [_id] }
    })
      .then(() => {
        Alert.success('You successfully deleted a customer');
        history.push('/contacts/customers');
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

  const updatedProps = {
    ...props,
    remove,
    merge
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
