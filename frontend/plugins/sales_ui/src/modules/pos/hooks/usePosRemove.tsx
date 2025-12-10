import { useMutation } from '@apollo/client';
import { mutations } from '@/pos/graphql';

export const usePosRemove = () => {
  const [posRemove, { loading, error }] = useMutation(mutations.posRemove, {
    update: (cache, { data }) => {
      if (data?.posRemove) {
        cache.evict({ fieldName: 'posList' });
        cache.gc();
      }
    },
  });

  return {
    posRemove,
    loading,
    error,
  };
};
