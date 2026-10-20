import { useMutation } from '@apollo/client';
import { useState } from 'react';
import { GET_MN_CONFIGS, REMOVE_MN_CONFIG } from '@/shared/graphql/mnConfigs';

export const useRemovePosInEbarimtConfigs = () => {
  const [removeConfig] = useMutation(REMOVE_MN_CONFIG, {
    refetchQueries: [{ query: GET_MN_CONFIGS, variables: { code: 'posInEbarimt' } }],
  });
  const [loading, setLoading] = useState(false);

  const removeConfigs = async (ids: string[]) => {
    setLoading(true);
    try {
      await Promise.all(ids.map((id) => removeConfig({ variables: { id } })));
    } finally {
      setLoading(false);
    }
  };

  return { removeConfigs, loading };
};
