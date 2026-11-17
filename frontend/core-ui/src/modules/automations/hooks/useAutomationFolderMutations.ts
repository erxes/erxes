import {
  AUTOMATION_FOLDERS_ADD,
  AUTOMATION_FOLDERS_EDIT,
  AUTOMATION_FOLDERS_REMOVE,
  AUTOMATIONS_MOVE_TO_FOLDER,
} from '@/automations/graphql/automationFolders';
import { useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';

// Folder counts and the list both change with any of these
const REFETCH = ['AutomationFolders', 'AutomationsMain'];

const onError = (error: Error) =>
  toast({ title: error.message, variant: 'destructive' });

export const useAutomationFolderMutations = () => {
  const [addFolder, { loading: adding }] = useMutation(
    AUTOMATION_FOLDERS_ADD,
    { refetchQueries: REFETCH, onError },
  );
  const [editFolder, { loading: editing }] = useMutation(
    AUTOMATION_FOLDERS_EDIT,
    { refetchQueries: REFETCH, onError },
  );
  const [removeFolder, { loading: removing }] = useMutation(
    AUTOMATION_FOLDERS_REMOVE,
    { refetchQueries: REFETCH, onError },
  );
  const [moveToFolder, { loading: moving }] = useMutation(
    AUTOMATIONS_MOVE_TO_FOLDER,
    { refetchQueries: REFETCH, onError },
  );

  return {
    addFolder,
    editFolder,
    removeFolder,
    moveToFolder,
    saving: adding || editing,
    removing,
    moving,
  };
};
