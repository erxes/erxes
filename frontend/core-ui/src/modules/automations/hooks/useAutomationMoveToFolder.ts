import { useAutomationFolderMutations } from '@/automations/hooks/useAutomationFolderMutations';
import { IAutomation } from '@/automations/types';
import { Row } from '@tanstack/table-core';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const useAutomationMoveToFolder = (rows: Row<IAutomation>[]) => {
  const { t } = useTranslation('automations');
  const { moveToFolder, moving } = useAutomationFolderMutations();

  /** `null` takes them out of their folder. */
  const move = async (folderId: string | null, folderName?: string) => {
    const result = await moveToFolder({
      variables: {
        automationIds: rows.map((row) => row.original._id),
        folderId,
      },
    });

    if (result.errors?.length || !result.data) {
      return;
    }

    rows.forEach((row) => row.toggleSelected(false));
    toast({
      title: folderId
        ? t('folder-moved-into', { name: folderName })
        : t('folder-moved-out'),
      variant: 'success',
    });
  };

  return { move, moving };
};
