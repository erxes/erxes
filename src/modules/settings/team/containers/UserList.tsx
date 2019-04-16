import client from 'apolloClient';
import gql from 'graphql-tag';
import { Alert } from 'modules/common/utils';
import { generatePaginationParams } from 'modules/common/utils/router';
import {
  ICommonFormProps,
  ICommonListProps
} from 'modules/settings/common/types';
import { queries as permissionQueries } from 'modules/settings/permissions/graphql';
import { IUserGroup } from 'modules/settings/permissions/types';
import * as React from 'react';
import { graphql } from 'react-apollo';
import { commonListComposer } from '../../utils';
import { UserList } from '../components';
import { mutations, queries } from '../graphql';

type Props = ICommonListProps &
  ICommonFormProps & {
    statusChangedMutation: any;
    listQuery: any;
  };

class UserListContainer extends React.Component<
  Props,
  { usersGroups: IUserGroup[] }
> {
  constructor(props) {
    super(props);

    this.state = { usersGroups: [] };
  }

  componentDidMount() {
    client
      .query({
        query: gql(permissionQueries.usersGroups)
      })
      .then(({ data: { usersGroups } }: any) => {
        this.setState({ usersGroups });
      });
  }

  changeStatus = (id: string): void => {
    const { statusChangedMutation, listQuery } = this.props;

    statusChangedMutation({
      variables: { _id: id }
    })
      .then(() => {
        listQuery.refetch();

        Alert.success('Congrats, Successfully updated.');
      })
      .catch((error: Error) => {
        Alert.error(error.message);
      });
  };

  render() {
    return (
      <UserList
        {...this.props}
        usersGroups={this.state.usersGroups}
        changeStatus={this.changeStatus}
      />
    );
  }
}

const options = ({ queryParams }: { queryParams: any }) => {
  return {
    variables: {
      ...generatePaginationParams(queryParams),
      searchValue: queryParams.searchValue,
      isActive: queryParams.isActive === 'false' ? false : true
    }
  };
};

export default commonListComposer<{ queryParams: any; history: any }>({
  text: 'team member',

  name: 'users',

  gqlListQuery: graphql(gql(queries.users), {
    name: 'listQuery',
    options
  }),
  gqlAddMutation: graphql(gql(mutations.usersInvite), {
    name: 'addMutation'
  }),
  gqlEditMutation: graphql(gql(mutations.usersEdit), {
    name: 'editMutation'
  }),
  gqlRemoveMutation: graphql<{ queryParams: any }>(
    gql(mutations.usersSetActiveStatus),
    {
      name: 'statusChangedMutation',
      options: ({ queryParams }) => ({
        refetchQueries: [
          {
            query: gql(queries.users),
            variables: {
              ...generatePaginationParams(queryParams),
              isActive: !(queryParams.isActive === 'false' ? false : true)
            }
          }
        ]
      })
    }
  ),
  gqlTotalCountQuery: graphql(gql(queries.usersTotalCount), {
    name: 'totalCountQuery',
    options
  }),
  ListComponent: UserListContainer
});
