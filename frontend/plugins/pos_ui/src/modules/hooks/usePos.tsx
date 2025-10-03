import { useQuery, useMutation } from '@apollo/client';
import { useEffect } from 'react';
import { queries, mutations } from '../graphql';
import { AlertInterface, ConfirmFunction, PosListQueryResponse, QueryParams, RemoveMutationResponse, RouterInterface } from '../types/mutations';

export function usePosListManager({
  router,
  queryParams = {},
  shouldRefetchList = false,
  confirm,
  Alert
}: {
  router: RouterInterface;
  queryParams: QueryParams;
  shouldRefetchList?: boolean;
  confirm: ConfirmFunction;
  Alert: AlertInterface;
}) {
  const posListQuery = useQuery<PosListQueryResponse>(queries.posList, {
    variables: {
      ...router.generatePaginationParams(queryParams || {}),
      status: queryParams.status,
      sortField: queryParams.sortField,
      sortDirection: queryParams.sortDirection
        ? parseInt(String(queryParams.sortDirection), 10)
        : undefined,
    },
    fetchPolicy: 'network-only',
    errorPolicy: "all",
    onError: (error) => {
      console.error("PosList query error:", error.message);
    }
  });

  const [posRemove] = useMutation<RemoveMutationResponse>(
    mutations.posRemove,
    {
      onError: (error) => {
        console.error("PosRemove mutation error:", error.message);
      }
    }
  );

  useEffect(() => {
    refetch();
  }, [queryParams.page]);

  useEffect(() => {
    if (shouldRefetchList) {
      refetch();
    }
  }, [shouldRefetchList]);

  const refetch = () => {
    posListQuery.refetch();
  };

  const remove = (posId: string) => {
    const message = 'Are you sure?';

    confirm(message).then(() => {
      posRemove({
        variables: { _id: posId },
      })
        .then(() => {
          refetch();

          Alert.success('You successfully deleted a pos.');
        })
        .catch((e) => {
          Alert.error(e.message);
        });
    });
  };

  const permissionError = posListQuery.error?.graphQLErrors?.some(
    e => e.message === "Permission required" || e.extensions?.code === "INTERNAL_SERVER_ERROR"
  );

  return {
    loading: posListQuery.loading,
    error: posListQuery.error,
    permissionError,
    posList: posListQuery.data?.posList || [],
    refetch,
    remove
  };
}