import { useMutation } from '@apollo/client';
import { FACEBOOK_REPAIR } from '../graphql/mutations/fbConfig';

export const useFbIntegrationsRepair = () => {
  const [repairIntegrations, { loading }] = useMutation(FACEBOOK_REPAIR);

  return { repairIntegrations, loading };
};
