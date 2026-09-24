import { useMutation } from '@apollo/client';
import { WHATSAPP_UPDATE_CONFIGS } from '../graphql/mutations/whatsappConfig';

export const useWhatsappUpdateConfigs = () => {
  const [updateConfigs, { loading }] = useMutation(WHATSAPP_UPDATE_CONFIGS, {
    refetchQueries: ['WhatsappGetConfigs'],
  });

  return { updateConfigs, loading };
};
