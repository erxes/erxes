import { AUTOMATION_FOLDERS } from '@/automations/graphql/automationFolders';
import { IAutomationFolder } from '@/automations/types';
import { useQuery } from '@apollo/client';

export const useAutomationFolders = () => {
  const { data, loading, error } = useQuery<{
    automationFolders: IAutomationFolder[];
  }>(AUTOMATION_FOLDERS);

  return { folders: data?.automationFolders || [], loading, error };
};
