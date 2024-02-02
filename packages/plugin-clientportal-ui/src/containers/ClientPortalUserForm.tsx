import { AppConsumer, ButtonMutate } from '@erxes/ui/src';
import { IUser, UsersQueryResponse } from '@erxes/ui/src/auth/types';
import {
  IButtonMutateProps,
  IQueryParams,
  IRouterProps,
} from '@erxes/ui/src/types';
import { gql } from '@apollo/client';
import React from 'react';

import ClientPortalUserForm from '../components/forms/ClientPortalUserForm';
import { mutations, queries } from '../graphql';
import { ClientPortalConfigsQueryResponse, IClientPortalUser } from '../types';
import { useQuery } from '@apollo/client';

type Props = {
  clientPortalUser: IClientPortalUser;
  closeModal: () => void;
  queryParams: IQueryParams;
  kind: 'client' | 'vendor';
};

type FinalProps = {
  usersQuery: UsersQueryResponse;
  currentUser: IUser;
  clientPortalConfigsQuery: ClientPortalConfigsQueryResponse;
} & Props &
  IRouterProps;

const ClientPortalUserFormContainer: React.FC<FinalProps> = (
  props: FinalProps,
) => {
  const { closeModal, kind } = props;

  const clientPortalConfigsQuery = useQuery(gql(queries.getConfigs), {
    fetchPolicy: 'network-only',
    variables: { kind },
  });

  if (clientPortalConfigsQuery.loading) {
    return null;
  }

  const renderButton = ({
    name,
    values,
    isSubmitted,
    object,
  }: IButtonMutateProps) => {
    const cleanValues = (obj) => {
      const newObj = { ...obj };

      Object.keys(newObj).forEach((key) => {
        const val = newObj[key];
        if (val === null || val === undefined || val === '') {
          delete newObj[key];
        }
      });

      return newObj;
    };

    const afterSave = (_data) => {
      closeModal();
    };

    return (
      <ButtonMutate
        mutation={
          object
            ? mutations.clientPortalUsersEdit
            : mutations.clientPortalUsersInvite
        }
        variables={cleanValues(values)}
        callback={afterSave}
        refetchQueries={getRefetchQueries()}
        isSubmitted={isSubmitted}
        type="submit"
        successMessage={`You successfully ${
          object ? 'updated' : 'added'
        } a ${name}`}
      >
        Invite
      </ButtonMutate>
    );
  };

  const clientPortalGetConfigs =
    (clientPortalConfigsQuery.data &&
      clientPortalConfigsQuery.data.clientPortalGetConfigs) ||
    [];

  const updatedProps = {
    ...props,
    clientPortalGetConfigs,
    renderButton,
  };

  return (
    <AppConsumer>
      {({ currentUser }) => (
        <ClientPortalUserForm
          {...updatedProps}
          currentUser={currentUser || ({} as IUser)}
        />
      )}
    </AppConsumer>
  );
};

const getRefetchQueries = () => {
  return ['clientPortalUsers', 'clientPortalUserCounts'];
};

export default ClientPortalUserFormContainer;
