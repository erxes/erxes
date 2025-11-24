import { MutationHookOptions, useMutation } from '@apollo/client';
import { IPutResponse } from '@/put-response/types/PutResponseType';
import { putResponseQueries } from '@/put-response/graphql/PutResopnseQueries';
import { putResponseRemoveMutation } from '@/put-response/detail/graphql/mutations/PutResponseRemoveMutations';

const PUT_RESPONSE_PAGE_SIZE = 30;

const updateCacheAfterRemove = (cache: any, putResponseIds: string[]) => {
  try {
    const queryOptions = {
      query: putResponseQueries.putResponses,
      variables: { perPage: PUT_RESPONSE_PAGE_SIZE },
    };

    const data = cache.readQuery(queryOptions);
    if (!data?.putResponses) return;

    const updatedList = data.putResponses.list.filter(
      (putResponse: IPutResponse) => !putResponseIds.includes(putResponse._id),
    );

    const updatedTotalCount = Math.max(
      0,
      data.putResponses.totalCount - putResponseIds.length,
    );

    cache.writeQuery({
      ...queryOptions,
      data: {
        putResponses: {
          ...data.putResponses,
          list: updatedList,
          totalCount: updatedTotalCount,
        },
      },
    });
  } catch (e) {
    console.error('Cache update failed:', e);
  }
};

export const useRemovePutResponse = () => {
  const [_removePutResponse, { loading }] = useMutation(
    putResponseRemoveMutation.putResponseRemove,
  );

  const removePutResponse = (
    putResponseIds: string[],
    options?: MutationHookOptions,
  ) => {
    _removePutResponse({
      ...options,
      variables: { putResponseIds, ...options?.variables },
      update: (cache) => updateCacheAfterRemove(cache, putResponseIds),
    });
  };

  return { removePutResponse, loading };
};
