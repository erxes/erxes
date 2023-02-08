import React from 'react';
import { queries, mutations } from '../../graphql';
import gql from 'graphql-tag';
import GroupList from '../../components/permission/GroupList';
import { RemoveMutationResponse } from '../../types';
import { IRouterProps } from '@erxes/ui/src/types';
import { Alert, withProps, confirm } from '@erxes/ui/src/utils';
import * as compose from 'lodash.flowright';
import { graphql } from 'react-apollo';
import { IUserGroupDocument } from '../../types';

type Props = {
  queryParams: any;
  permissionGroups?: IUserGroupDocument[];
};

type FinalProps = Props & RemoveMutationResponse & IRouterProps;

function List({ queryParams, removeMutation, permissionGroups }: FinalProps) {
  const remove = id => {
    confirm('Are you sure?')
      .then(() => removeMutation({ variables: { _id: id } }))
      .catch(e => {
        Alert.error(e.message);
      });
  };

  return (
    <GroupList
      remove={remove}
      queryParams={queryParams}
      objects={permissionGroups}
    />
  );
}

export default withProps<Props>(
  compose(
    graphql<RemoveMutationResponse, { _id: string }>(
      gql(mutations.permissionGroupDelete),
      {
        name: 'removeMutation',
        options: () => ({
          refetchQueries: queries.permissionGroupRefetch
        })
      }
    )
  )(List)
);
