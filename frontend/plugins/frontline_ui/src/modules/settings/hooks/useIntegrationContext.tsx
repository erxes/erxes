import { useContext } from 'react';
import { IntegrationContext } from '@/settings/context/IntegrationContext';

export const useIntegrationContext = () => {
  return useContext(IntegrationContext);
};
