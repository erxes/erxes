import { AppConsumer, ButtonMutate } from '@erxes/ui/src';
import { ClientPortalConfigsQueryResponse, IClientPortalUser } from '../types';
import { IButtonMutateProps, IQueryParams } from '@erxes/ui/src/types';
import { IUser, UsersQueryResponse } from '@erxes/ui/src/auth/types';
import { mutations, queries } from '../graphql';

import ClientPortalMoveForm from '../components/forms/ClientPortalMoveForm';
import React from 'react';
import { gql } from '@apollo/client';
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
} & Props;

const ClientPortalMoveFormContainer: React.FC<FinalProps> = (
  props: FinalProps
) => {
  const { closeModal, kind } = props;

  const clientPortalConfigsQuery = useQuery(gql(queries.getConfigs), {
    fetchPolicy: 'network-only',
    variables: { kind },
  });

  if (clientPortalConfigsQuery.loading) {
    return null;
  }

  const renderButton = ({ values, isSubmitted }: IButtonMutateProps) => {
    const afterSave = (_data) => {
      closeModal();
    };

    return (
      <ButtonMutate
        mutation={mutations.clientPortalUsersMove}
        variables={values}
        callback={afterSave}
        refetchQueries={getRefetchQueries()}
        isSubmitted={isSubmitted}
        type="submit"
        successMessage={'You successfully updated'}
      ></ButtonMutate>
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
        <ClientPortalMoveForm
          {...updatedProps}
          currentUser={currentUser || ({} as IUser)}
        />
      )}
    </AppConsumer>
  );
};

const getRefetchQueries = () => {
  return [
    'clientPortalUsers',
    'clientPortalUserCounts',
    'clientPortalGetConfigs',
  ];
};

export default ClientPortalMoveFormContainer;
