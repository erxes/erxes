import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import React from 'react';
import { gql, useQuery } from '@apollo/client';
import ClientForm from '../components/Form';
import Spinner from '@erxes/ui/src/components/Spinner';

type Props = {
  closeModal: () => void;
};

const ADD = `
  mutation ClientsAdd(
    $name: String!
    $whiteListedIps: [String]
    $permissions: [String]
  ) {
    clientsAdd(
      name: $name
      whiteListedIps: $whiteListedIps
      permissions: $permissions
    ) {
      clientId
      clientSecret
    }
  }
`;

const EDIT = `
  mutation ClientsEdit(
    $id: String!
    $name: String
    $whiteListedIps: [String]
    $permissions: [String]
  ) {
    clientsEdit(
      _id: $id
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

const ClientFormContainer = (props: Props) => {

  const {data, loading} = useQuery(PERMISSION_MODULES);

  if (loading) {
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
        // refetchQueries={getRefetchQueries()}
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

  const updatedProps = {
    ...props,
    modules,
    renderButton,
  };

  return <ClientForm {...updatedProps} />;
};

// const getRefetchQueries = () => {
//   return [
//     {
//       query: gql(queries.listQuery),
//       fetchPolicy: 'network-only',
//     },
//   ];
// };

export default ClientFormContainer;
