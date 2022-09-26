import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { Alert, confirm, withProps, Bulk, router } from '@erxes/ui/src';
import React from 'react';
import { graphql } from 'react-apollo';
import {
  IRouterProps,
  PosListQueryResponse,
  RemoveMutationResponse
} from '../../types';

import { queries, mutations } from '../graphql';
import List from '../components/List';

type Props = {
  queryParams: any;
  history: any;
};

type FinalProps = {
  posListQuery: PosListQueryResponse;
} & RemoveMutationResponse &
  IRouterProps &
  Props;

class ListContainer extends React.Component<FinalProps> {
  componentDidMount() {
    const { history } = this.props;

    const shouldRefetchList = router.getParam(history, 'refetchList');

    if (shouldRefetchList) {
      this.refetch();
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.queryParams.page !== prevProps.queryParams.page) {
      this.props.posListQuery.refetch();
    }
  }

  refetch = () => {
    const { posListQuery } = this.props;

    posListQuery.refetch();
  };

  render() {
    const { posListQuery, removeMutation } = this.props;

    const posList = posListQuery.posList || [];

    const remove = (posId: string) => {
      const message = 'Are you sure?';

      confirm(message).then(() => {
        removeMutation({
          variables: { _id: posId }
        })
          .then(() => {
            // refresh queries
            this.refetch();

            Alert.success('You successfully deleted a pos.');
          })
          .catch(e => {
            Alert.error(e.message);
          });
      });
    };

    const updatedProps = {
      ...this.props,
      posList,
      remove,
      loading: posListQuery.loading,
      refetch: this.refetch
    };

    const content = props => {
      return <List {...updatedProps} {...props} />;
    };

    return <Bulk content={content} refetch={this.refetch} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<
      Props,
      PosListQueryResponse,
      {
        page?: number;
        perPage?: number;
        tag?: string;
        brand?: string;
        status?: string;
      }
    >(gql(queries.posList), {
      name: 'posListQuery',
      options: ({ queryParams }) => {
        return {
          variables: {
            ...router.generatePaginationParams(queryParams || {}),
            status: queryParams.status,
            sortField: queryParams.sortField,
            sortDirection: queryParams.sortDirection
              ? parseInt(queryParams.sortDirection, 10)
              : undefined
          },
          fetchPolicy: 'network-only'
        };
      }
    }),
    graphql<Props, RemoveMutationResponse, { _id: string }>(
      gql(mutations.posRemove),
      {
        name: 'removeMutation'
      }
    )
  )(ListContainer)
);
