import { useMutation } from '@apollo/client';
import { UPDATE_CALL_CONFIGS } from '../graphql/mutations/callConfigMutations';

export const useCallUpdateConfigs = () => {
  const [updateConfigs, { loading }] = useMutation(UPDATE_CALL_CONFIGS);

  return { updateConfigs, loading };
};
