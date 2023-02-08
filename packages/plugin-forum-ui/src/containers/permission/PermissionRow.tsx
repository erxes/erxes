import React from 'react';
import { mutations } from '../../graphql';
import { useMutation } from 'react-apollo';
import { IPermission } from '../../types';
import Row from '../../components/permission/PermissionRow';
import gql from 'graphql-tag';
import { confirm } from '@erxes/ui/src/utils';

type Props = {
  permissions: IPermission[];
};

function PermissionRow({ permissions }: Props) {
  const [mutRemove] = useMutation(gql(mutations.removePermit), {
    refetchQueries: ['ForumPermissionGroupCategoryPermits'],
    onError: e => {
      console.error(e);
    }
  });

  const removeItem = (
    _id: string,
    permission: string,
    categoryIds: string[]
  ) => {
    confirm('Are you sure?').then(() =>
      mutRemove({ variables: { _id, categoryIds, permission } })
    );
  };

  return <Row permissions={permissions} removeItem={removeItem} />;
}

export default PermissionRow;
