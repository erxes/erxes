import { Alert } from '@erxes/ui/src/utils';
import {
  ClientPortalUserRemoveMutationResponse,
  ClientPortalUserTotalCountQueryResponse,
  ClientPortalUsersQueryResponse,
  ClientPortalVerifyUsersMutationResponse,
} from '../types';
import { mutations, queries } from '../graphql';

import Bulk from '@erxes/ui/src/components/Bulk';
import ClientPortalUserList from '../components/list/ClientPortalUserList';
import React, { useState } from 'react';
import { generatePaginationParams } from '@erxes/ui/src/utils/router';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client';

type Props = {
  queryParams: any;
  kind?: string;
};

type FinalProps = Props &
  ClientPortalUserRemoveMutationResponse &
  ClientPortalVerifyUsersMutationResponse;

const ClientportalUserListContainer: React.FC<FinalProps> = (
  props: FinalProps
) => {
  const [loading, setLoading] = useState(false);
  const { queryParams } = props;

  const clientPortalUsersQuery = useQuery<ClientPortalUsersQueryResponse>(
    gql(queries.clientPortalUsers),
    {
      variables: {
        searchValue: queryParams.searchValue,
        cpId: queryParams.cpId,

        dateFilters: queryParams.dateFilters,
        ...generatePaginationParams(queryParams),
      },
      fetchPolicy: 'network-only',
    }
  );
  const clientPortalUserTotalCountQuery =
    useQuery<ClientPortalUserTotalCountQueryResponse>(
      gql(queries.clientPortalUserCounts),
      {
        fetchPolicy: 'network-only',
      }
    );

  const [clientPortalUsersRemove] = useMutation(
    gql(mutations.clientPortalUsersRemove),
    {
      refetchQueries: getRefetchQueries(),
    }
  );

  const [clientPortalUsersVerify] = useMutation(gql(mutations.verifyUsers), {
    refetchQueries: getRefetchQueries(),
  });

  // remove action
  const removeUsers = ({ clientPortalUserIds }, emptyBulk) => {
    clientPortalUsersRemove({
      variables: { clientPortalUserIds },
    })
      .then(() => {
        emptyBulk();
        Alert.success('You successfully deleted a client portal user');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const verifyUsers = (type, userIds) => {
    clientPortalUsersVerify({
      variables: {
        type,
        userIds,
      },
    })
      .then(() => {
        Alert.success('You successfully verified a client portal user');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const clientPortalUsers =
    (clientPortalUsersQuery.data &&
      clientPortalUsersQuery.data.clientPortalUsers) ||
    [];

  const searchValue = props.queryParams.searchValue || '';

  const updatedProps = {
    ...props,
    clientPortalUsers,
    clientPortalUserCount:
      (clientPortalUserTotalCountQuery.data &&
        clientPortalUserTotalCountQuery.data.clientPortalUserCounts) ||
      0,
    searchValue,
    queryParams,
    loading: clientPortalUsersQuery.loading || loading,
    removeUsers,
    verifyUsers,
  };

  const content = props => {
    return <ClientPortalUserList {...updatedProps} {...props} />;
  };

  return <Bulk content={content} refetch={clientPortalUsersQuery.refetch} />;
};

const getRefetchQueries = () => {
  return ['clientPortalUserCounts', 'clientPortalUsers'];
};

export default ClientportalUserListContainer;
