import { useMutation } from '@apollo/client';
import { FACEBOOK_REPAIR } from '../graphql/mutations/fbConfig';

export const useFbIntegrationsRepair = () => {
  const [repairIntegrations, { loading }] = useMutation<
    { integrationsRepair: unknown },
    { _id: string; kind?: string }
  >(FACEBOOK_REPAIR);

  return { repairIntegrations, loading };
};
