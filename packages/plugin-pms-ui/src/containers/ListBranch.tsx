import { gql, useQuery, useMutation } from '@apollo/client';
import { Alert, confirm, Bulk, router } from '@erxes/ui/src';
import React, { useEffect, useState } from 'react';
import { RemoveMutationResponse } from '../types';

import { queries, mutations } from '../graphql';
import List from '../components/ListBranch';
import { useLocation } from 'react-router-dom';

type Props = {
  queryParams: any;
};

const ListContainer = (props: Props) => {
  const { queryParams } = props;
  const location = useLocation();
  const [tmsLink, setTmsLink] = useState('');
  const shouldRefetchList = router.getParam(location, 'refetchList');

  const branchListQuery = useQuery(gql(queries.tmBranchList), {
    variables: {
      ...router.generatePaginationParams(queryParams || {}),
      status: queryParams.status,
      sortField: queryParams.sortField,
      sortDirection: queryParams.sortDirection
        ? parseInt(queryParams.sortDirection, 10)
        : undefined
    },
    fetchPolicy: 'network-only'
  });

  const [posRemove] = useMutation<RemoveMutationResponse>(
    gql(mutations.tmsBranchRemove)
  );

  useEffect(() => {
    const parts = window.location.host.split('.');
    if (parts.length === 4) {
      if (parts[1] + parts[2] + parts[3] === 'app.erxes.io') {
        setTmsLink('https://' + parts[0] + '.tms.erxes.io');
      }
    }
    refetch();
  }, [queryParams.page]);

  useEffect(() => {
    if (shouldRefetchList) {
      refetch();
    }
  }, [shouldRefetchList]);

  const refetch = () => {
    branchListQuery.refetch();
  };

  const remove = (posId: string) => {
    const message = 'Are you sure?';

    confirm(message).then(() => {
      posRemove({
        variables: { _id: posId }
      })
        .then(() => {
          // refresh queries
          refetch();

          Alert.success('You successfully deleted a tms branch.');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    });
  };

  const content = bulkProps => {
    const branchList = branchListQuery?.data?.tmsBranchList || [];
    const totalCount = branchList.length || 0;

    const updatedProps = {
      ...props,
      branchList,
      remove,
      loading: branchListQuery.loading,
      totalCount,
      tmsLink,
      refetch
    };

    return <List {...updatedProps} {...bulkProps} />;
  };

  return <Bulk content={content} refetch={refetch} />;
};

export default ListContainer;
