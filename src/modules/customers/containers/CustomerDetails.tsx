import gql from 'graphql-tag';
import EmptyState from 'modules/common/components/EmptyState';
import Spinner from 'modules/common/components/Spinner';
import { Alert, renderWithProps } from 'modules/common/utils';
import { mutations } from 'modules/conformity/graphql';
import {
  CreateConformityMutation,
  IConformityCreate
} from 'modules/conformity/types';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import CustomerDetails from '../components/detail/CustomerDetails';
import { queries } from '../graphql';
import { CustomerDetailQueryResponse } from '../types';

type IProps = {
  id: string;
};

type FinalProps = {
  customerDetailQuery: CustomerDetailQueryResponse;
  createConformityMutation: CreateConformityMutation;
} & IProps;

class CustomerDetailsContainer extends React.Component<FinalProps, {}> {
  constructor(props) {
    super(props);

    this.createConformity = this.createConformity.bind(this);
  }

  createConformity = (relType: string, relTypeIds: string[]) => {
    const { id, createConformityMutation } = this.props;

    createConformityMutation({
      variables: {
        mainType: 'customer',
        mainTypeId: id,
        relType,
        relTypeIds
      }
    })
      .then(() => {
        Alert.success('success changed companies');
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };
  render() {
    const { id, customerDetailQuery } = this.props;

    if (customerDetailQuery.loading) {
      return <Spinner objective={true} />;
    }

    if (!customerDetailQuery.customerDetail) {
      return (
        <EmptyState text="Customer not found" image="/images/actions/17.svg" />
      );
    }

    const taggerRefetchQueries = [
      {
        query: gql(queries.customerDetail),
        variables: { _id: id }
      }
    ];

    const updatedProps = {
      ...this.props,
      customer: customerDetailQuery.customerDetail || {},
      createConformity: this.createConformity,
      taggerRefetchQueries
    };

    return <CustomerDetails {...updatedProps} />;
  }
}

export default (props: IProps) => {
  return renderWithProps<IProps>(
    props,
    compose(
      graphql<IProps, CustomerDetailQueryResponse, { _id: string }>(
        gql(queries.customerDetail),
        {
          name: 'customerDetailQuery',
          options: ({ id }: { id: string }) => ({
            variables: {
              _id: id
            }
          })
        }
      ),
      graphql<IProps, CreateConformityMutation, IConformityCreate>(
        gql(mutations.conformityCreate),
        {
          name: 'createConformityMutation',
          options: ({ id }: { id: string }) => ({
            refetchQueries: [
              {
                query: gql(queries.customerDetail),
                variables: { _id: id }
              }
            ]
          })
        }
      )
    )(CustomerDetailsContainer)
  );
};
