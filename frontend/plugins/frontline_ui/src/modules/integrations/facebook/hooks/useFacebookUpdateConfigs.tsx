import { useMutation } from '@apollo/client';
import { FACEBOOK_UPDATE_CONFIGS } from '../graphql/mutations/fbConfig';

export const useFacebookUpdateConfigs = () => {
  const [updateConfigs, { loading }] = useMutation(FACEBOOK_UPDATE_CONFIGS);

  return { updateConfigs, loading };
};
