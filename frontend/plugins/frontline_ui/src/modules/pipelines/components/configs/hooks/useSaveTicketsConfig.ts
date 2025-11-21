import { useMutation } from '@apollo/client';
import { SAVE_TICKETS_CONFIG } from '../graphql';

export const useSaveTicketsConfig = () => {
  const [saveTicketsConfig, { loading }] = useMutation(SAVE_TICKETS_CONFIG, {
    refetchQueries: ['TicketConfigs'],
  });

  return {
    saveTicketsConfig,
    loading,
  };
};
