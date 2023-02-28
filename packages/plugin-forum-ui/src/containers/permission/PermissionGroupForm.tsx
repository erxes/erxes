import { Alert, __ } from '@erxes/ui/src/utils';
import { mutations, queries } from '../../graphql';
import { useMutation, useQuery } from 'react-apollo';

import { IRouterProps } from '@erxes/ui/src/types';
import { IUserGroupDocument } from '../../types';
import PermissionForm from '../../components/permission/PermissionGroupForm';
import React from 'react';
import gql from 'graphql-tag';

type Props = {
  group?: IUserGroupDocument;
  closeModal: () => void;
} & IRouterProps;

function PermissionGroupFormContainer({ closeModal, group }: Props) {
  const allUsers = useQuery(gql(queries.clientPortalUsers), {
    fetchPolicy: 'network-only'
  });

  const [addMut] = useMutation(gql(mutations.permissionGroupSetUsers));

  const [update] = useMutation(gql(mutations.permissionGroupPatch));
  const [create] = useMutation(gql(mutations.permissionGroupCreate));

  const onSave = ({ _id, name, ids, object }: any) => {
    if (object._id) {
      update({
        variables: {
          name,
          _id
        },
        refetchQueries: [
          {
            query: gql(queries.permissionGroupsQuery)
          }
        ]
      })
        .then(() =>
          addMut({
            variables: { _id, cpUserIds: ids },
            refetchQueries: [
              {
                query: gql(queries.permissionGroupsQuery)
              }
            ]
          })
        )
        .catch(error => {
          Alert.error(error.message);
        });
    }

    if (!object._id) {
      create({
        variables: { name },
        refetchQueries: [
          {
            query: gql(queries.permissionGroupsQuery)
          }
        ]
      })
        .then(() => addMut({ variables: { _id, cpUserIds: ids } }))
        .catch(error => {
          Alert.error(error.message);
        });
    }
  };

  return (
    <PermissionForm
      permissionGroup={group}
      onSave={onSave}
      closeModal={closeModal}
      allUsers={allUsers?.data?.clientPortalUsers}
    />
  );
}

export default PermissionGroupFormContainer;
