import { useAtomValue } from 'jotai';
import { currentOrganizationState } from 'ui-modules/states';

export const useVersion = (version: 'os' | 'saas' = 'os') => {
  const currentOrganization = useAtomValue(currentOrganizationState);

  return currentOrganization?.type === version;
};
