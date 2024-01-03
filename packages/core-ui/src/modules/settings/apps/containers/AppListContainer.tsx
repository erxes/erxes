import React from 'react';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import * as compose from 'lodash.flowright';

import { Alert, confirm, __ } from 'modules/common/utils';
import Spinner from 'modules/common/components/Spinner';
import { queries as permissionQueries } from '../../permissions/graphql/index';
import { mutations, queries } from '../graphql/index';
import AppList from '../components/AppList';
import {
  AppsQueryResponse,
  AppsTotalCountQueryResponse,
  AppsAddMutationResponse,
  AppsEditMutationResponse,
  AppsRemoveMutationResponse,
  IAppParams,
  IAppEditParams,
  IApp
} from '../types';

type Props = {
  listQuery: AppsQueryResponse;
  totalCountQuery: AppsTotalCountQueryResponse;
  addMutation: (params: { variables: IAppParams }) => Promise<IApp>;
  editMutation: (params: { variables: IAppEditParams }) => Promise<IApp>;
  removeMutation: (params: { variables: { _id: string } }) => Promise<string>;
  userGroupsQuery: any;
};

class AppListContainer extends React.Component<Props> {
  render() {
    const {
      listQuery,
      totalCountQuery,
      userGroupsQuery,
      addMutation,
      editMutation,
      removeMutation
    } = this.props;

    const isLoading =
      listQuery.loading || totalCountQuery.loading || userGroupsQuery.loading;

    if (isLoading) {
      return <Spinner />;
    }

    const addApp = (doc: IAppParams) => {
      addMutation({ variables: doc })
        .then(() => {
          Alert.success('You successfully created an app');
        })
        .catch(e => {
          Alert.error(__(e.message));
        });
    };

    const editApp = (_id: string, doc: IAppParams) => {
      editMutation({ variables: { _id, ...doc } })
        .then(() => {
          Alert.success('You successfully edited an app');
        })
        .catch(e => {
          Alert.error(__(e.message));
        });
    };

    const removeApp = (_id: string) => {
      confirm().then(() => {
        removeMutation({ variables: { _id } })
          .then(() => {
            Alert.success('You successfully deleted an app');
          })
          .catch(e => {
            Alert.error(__(e.message));
          });
      });
    };

    return (
      <AppList
        apps={listQuery.apps}
        isLoading={isLoading}
        count={totalCountQuery.appsTotalCount}
        errorMessage={listQuery.error || ''}
        addApp={addApp}
        editApp={editApp}
        removeApp={removeApp}
        userGroups={userGroupsQuery.usersGroups}
      />
    );
  }
}

const options = () => ({ refetchQueries: ['apps'] });

export default compose(
  graphql(gql(queries.apps), {
    name: 'listQuery'
  }),
  graphql<AppsAddMutationResponse, Props>(gql(mutations.appsAdd), {
    name: 'addMutation',
    options
  }),
  graphql<AppsEditMutationResponse, Props>(gql(mutations.appsEdit), {
    name: 'editMutation',
    options
  }),
  graphql<AppsRemoveMutationResponse, Props>(gql(mutations.appsRemove), {
    name: 'removeMutation',
    options
  }),
  graphql(gql(queries.appsTotalCount), {
    name: 'totalCountQuery'
  }),
  graphql(gql(permissionQueries.usersGroups), {
    name: 'userGroupsQuery'
  })
)(AppListContainer);
