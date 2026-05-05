import { useMutation } from '@apollo/client';
import { REMOVE_MN_CONFIG, GET_MN_CONFIGS } from '@/ebarimt/settings/pos-in-ebarimt-config/graphql/mnConfigs';
import { useState } from 'react';

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
