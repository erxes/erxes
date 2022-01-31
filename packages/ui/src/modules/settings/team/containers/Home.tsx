import React from 'react';
import { useQuery } from 'react-apollo';
import gql from 'graphql-tag';

import { queries as generalQueries } from 'modules/settings/general/graphql';
import Home from '../components/Home';
import { options } from './UserList';
import { queries, mutations } from '../graphql';
import { IButtonMutateProps } from 'modules/common/types';
import ButtonMutate from 'modules/common/components/ButtonMutate';
import { queries as permissionQueries } from 'modules/settings/permissions/graphql';

type Props = {
  queryParams: any;
  history: any;
};

function HomeContainer(props: Props) {
  const usersGroupQuery = useQuery(gql(permissionQueries.usersGroups));
  const configsEnvQuery = useQuery(gql(generalQueries.configsGetEnv));

  const getRefetchQueries = () => {
    return [
      { query: gql(queries.users), options },
      { query: gql(queries.usersTotalCount), options }
    ];
  };

  const renderButton = ({
    name,
    values,
    isSubmitted,
    callback,
    object
  }: IButtonMutateProps) => {
    return (
      <ButtonMutate
        mutation={mutations.usersInvite}
        variables={values}
        callback={callback}
        refetchQueries={getRefetchQueries()}
        isSubmitted={isSubmitted}
        type="submit"
        successMessage={`You successfully ${
          object ? 'updated' : 'added'
        } a ${name}`}
      />
    );
  };

  const usersGroups = usersGroupQuery.loading
    ? []
    : usersGroupQuery.data.usersGroups || [];

  return (
    <Home
      configsEnvQuery={configsEnvQuery}
      usersGroups={usersGroups}
      renderButton={renderButton}
      loading={usersGroupQuery.loading}
      {...props}
    />
  );
}

export default HomeContainer;
