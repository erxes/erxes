import { MutationHookOptions, useMutation } from '@apollo/client';
import { IPutResponse } from '@/put-response/types/PutResponseType';
import { putResponseQueries } from '@/put-response/graphql/PutResopnseQueries';
import { putResponseRemoveMutation } from '@/put-response/detail/graphql/mutations/PutResponseRemoveMutations';

const PUT_RESPONSE_PAGE_SIZE = 30;

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
      update: (cache) => {
        try {
          cache.updateQuery(
            {
              query: putResponseQueries.putResponses,
              variables: { perPage: PUT_RESPONSE_PAGE_SIZE },
            },
            ({ putResponses }) => ({
              putResponses: {
                ...putResponses,
                list: putResponses.list.filter(
                  (putResponse: IPutResponse) =>
                    !putResponseIds.includes(putResponse._id),
                ),
                totalCount: Math.max(
                  0,
                  putResponses.totalCount - putResponseIds.length,
                ),
              },
            }),
          );
        } catch (e) {
          console.error('Cache update failed:', e);
        }
      },
    });
  };

  return { removePutResponse, loading };
};
