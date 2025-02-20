import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import React from 'react';
import { gql, useQuery } from '@apollo/client';
import ClientForm from '../components/Form';
import Spinner from '@erxes/ui/src/components/Spinner';

type Props = {
  _id?: string;
  refetch?: () => void;
  closeModal: () => void;
};

const ADD = `
mutation ClientsAdd($name: String!, $whiteListedIps: [String], $permissions: [ClientPermissionInput]) {
  clientsAdd(name: $name, whiteListedIps: $whiteListedIps, permissions: $permissions) {
    clientSecret
    clientId
  }
}
`;

const EDIT = `
  mutation ClientsEdit(
    $_id: String!
    $name: String
    $whiteListedIps: [String]
    $permissions: [ClientPermissionInput]
  ) {
    clientsEdit(
      _id: $_id
      name: $name
      whiteListedIps: $whiteListedIps
      permissions: $permissions
    ) {
      _id
    }
  }
`;

const PERMISSION_MODULES = gql`
  query PermissionModules {
    permissionModules {
      name
      description

      actions {
        name
        description
      }
    }
  }
`;

const DETAIL_QUERY = gql`
  query ClientDetail($id: String) {
    clientDetail(_id: $id) {
      _id
      name
      permissions {
        module
        
        actions
      }
      whiteListedIps
    }
  }
`;

const ClientFormContainer = (props: Props) => {
  const { data, loading } = useQuery(PERMISSION_MODULES);
  const { data: detailData, loading: detailLoading } = useQuery(DETAIL_QUERY, {
    variables: {
      id: props._id,
    },
    skip: !props._id,
  });

  if (loading || detailLoading) {
    return <Spinner />;
  }

  const renderButton = ({
    values,
    isSubmitted,
    callback,
    object,
  }: IButtonMutateProps) => {
    const mutation = object ? EDIT : ADD;

    return (
      <ButtonMutate
        mutation={mutation}
        variables={values}
        callback={callback}
        isSubmitted={isSubmitted}
        type='submit'
        icon='check-circle'
        successMessage={`You successfully ${
          object ? 'updated' : 'added'
        } a app`}
      />
    );
  };

  const modules = data?.permissionModules || [];

  const client = detailData?.clientDetail || {};

  const updatedProps = {
    ...props,
    modules,
    client,
    renderButton,
  };

  return <ClientForm {...updatedProps} />;
};

export default ClientFormContainer;
