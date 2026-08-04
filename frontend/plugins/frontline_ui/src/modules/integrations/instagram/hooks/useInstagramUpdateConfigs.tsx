import { useMutation } from '@apollo/client';
import { INSTAGRAM_UPDATE_CONFIGS } from '../graphql/mutations/igConfig';

export const useInstagramUpdateConfigs = () => {
  const [updateConfigs, { loading }] = useMutation(INSTAGRAM_UPDATE_CONFIGS);

  return { updateConfigs, loading };
};
