import React from 'react';
import { queries, mutations } from '../../graphql';
import gql from 'graphql-tag';
import { IRouterProps } from '@erxes/ui/src/types';
import PermissionForm from '../../components/permission/PermissionGroupForm';
import { IUserGroupDocument } from '../../types';
import { useMutation, useQuery } from 'react-apollo';
import { __, Alert } from '@erxes/ui/src/utils';

type Props = {
  group?: IUserGroupDocument;
  closeModal: () => void;
} & IRouterProps;

function CategoryFormContainer({ closeModal, group }: Props) {
  const allUsers = useQuery(gql(queries.clientPortalUsers), {
    fetchPolicy: 'network-only'
  });

  const [addMut] = useMutation(gql(mutations.permissionGroupAddUsers), {
    refetchQueries: ['ForumPermissionGroup'],
    onError: e => console.error(e)
  });

  const [update] = useMutation(gql(mutations.permissionGroupPatch));
  const [create] = useMutation(gql(mutations.permissionGroupCreate));

  const renderButton = ({ _id, name, ids, object }: any) => {
    if (object._id) {
      console.log('update');
      update({
        variables: {
          name,
          _id
        }
      })
        .then(() => addMut({ variables: { _id, cpUserIds: ids } }))
        .catch(error => {
          Alert.error(error.message);
        });
    }
    if (!object._id) {
      console.log('create');
      create({
        variables: name
      })
        .then(() => addMut({ variables: { _id, cpUserIds: ids } }))
        .catch(error => {
          Alert.error(error.message);
        });
    }
    console.log('_id, name, ids, object', _id, name, ids, object);
  };

  return (
    <PermissionForm
      permissionGroup={group}
      renderButton={renderButton}
      closeModal={closeModal}
      allUsers={allUsers?.data?.clientPortalUsers}
    />
  );
}

export default CategoryFormContainer;
