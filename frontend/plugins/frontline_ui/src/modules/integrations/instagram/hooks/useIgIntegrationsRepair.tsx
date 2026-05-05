import { useMutation } from '@apollo/client';
import { INSTAGRAM_REPAIR } from '../graphql/mutations/igConfig';

export const useIgIntegrationsRepair = () => {
  const [repairIntegration, { loading }] = useMutation(INSTAGRAM_REPAIR);

  return { repairIntegration, loading };
};
