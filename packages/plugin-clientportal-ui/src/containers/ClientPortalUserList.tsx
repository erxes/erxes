import Bulk from '@erxes/ui/src/components/Bulk';
import { IRouterProps } from '@erxes/ui/src/types';
import { Alert, withProps } from '@erxes/ui/src/utils';
import { generatePaginationParams } from '@erxes/ui/src/utils/router';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';

import ClientPortalUserList from '../components/list/ClientPortalUserList';
import { mutations, queries } from '../graphql';
import {
  ClientPortalUserRemoveMutationResponse,
  ClientPortalUsersQueryResponse,
  ClientPortalUserTotalCountQueryResponse
} from '../types';

type Props = {
  queryParams: any;
  history: any;
  type?: string;
};

type FinalProps = {
  clientPortalUsersQuery: ClientPortalUsersQueryResponse;
  clientPortalUserTotalCountQuery: ClientPortalUserTotalCountQueryResponse;
} & Props &
  ClientPortalUserRemoveMutationResponse &
  IRouterProps;

type State = {
  loading: boolean;
};

class ClientportalUserListContainer extends React.Component<FinalProps, State> {
  constructor(props) {
    super(props);

    this.state = {
      loading: false
    };
  }

  render() {
    const {
      clientPortalUsersQuery,
      clientPortalUsersRemove,
      type,
      history,
      queryParams,
      clientPortalUserTotalCountQuery
    } = this.props;

    // remove action
    const removeUsers = ({ clientPortalUserIds }, emptyBulk) => {
      clientPortalUsersRemove({
        variables: { clientPortalUserIds }
      })
        .then(() => {
          emptyBulk();
          Alert.success('You successfully deleted a client portal user');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    const clientPortalUsers = clientPortalUsersQuery.clientPortalUsers || [];

    const searchValue = this.props.queryParams.searchValue || '';

    const updatedProps = {
      ...this.props,
      clientPortalUsers,
      clientPortalUserCount:
        clientPortalUserTotalCountQuery.clientPortalUserCounts || 0,
      searchValue,
      queryParams,
      loading: clientPortalUsersQuery.loading || this.state.loading,
      removeUsers
    };

    const content = props => {
      return <ClientPortalUserList {...updatedProps} {...props} />;
    };

    return (
      <Bulk
        content={content}
        refetch={this.props.clientPortalUsersQuery.refetch}
      />
    );
  }
}

const getRefetchQueries = () => {
  return ['clientPortalUserCounts', 'clientPortalUsers'];
};

const options = () => ({
  refetchQueries: getRefetchQueries()
});

export default withProps<Props>(
  compose(
    graphql<
      Props,
      ClientPortalUsersQueryResponse,
      { page: number; perPage: number }
    >(gql(queries.clientPortalUsers), {
      name: 'clientPortalUsersQuery',
      options: ({ queryParams }) => ({
        variables: {
          searchValue: queryParams.searchValue,
          cpId: queryParams.cpId,
          ...generatePaginationParams(queryParams)
        },
        fetchPolicy: 'network-only'
      })
    }),
    graphql<Props, ClientPortalUserTotalCountQueryResponse>(
      gql(queries.clientPortalUserCounts),
      {
        name: 'clientPortalUserTotalCountQuery',
        options: () => ({
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<
      Props,
      ClientPortalUserRemoveMutationResponse,
      { clientPortalUserIds: string[] }
    >(gql(mutations.clientPortalUsersRemove), {
      name: 'clientPortalUsersRemove',
      options
    })
  )(ClientportalUserListContainer)
);
