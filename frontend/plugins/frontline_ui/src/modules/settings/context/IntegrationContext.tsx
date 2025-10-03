import { createContext } from 'react';
import { IIntegrationContext } from '../types/integration';

export const IntegrationContext = createContext<IIntegrationContext>(
  {} as IIntegrationContext & { loading?: boolean },
);
