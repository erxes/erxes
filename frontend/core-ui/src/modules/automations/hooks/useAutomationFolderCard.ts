import { useAutomationFolderMutations } from '@/automations/hooks/useAutomationFolderMutations';
import { IAutomationFolder } from '@/automations/types';
import { toast, useConfirm } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export const useAutomationFolderCard = (folder: IAutomationFolder) => {
  const { t } = useTranslation('automations');
  const { confirm } = useConfirm();
  const { removeFolder, removing } = useAutomationFolderMutations();
  const [renaming, setRenaming] = useState(false);

  const remove = () =>
    confirm({
      message: t('folder-delete-confirm', {
        name: folder.name,
        count: folder.automationCount,
      }),
    }).then(async () => {
      const result = await removeFolder({ variables: { _id: folder._id } });

      if (!result.errors?.length && result.data) {
        toast({ title: t('folder-deleted'), variant: 'success' });
      }
    });

  return { renaming, setRenaming, remove, removing };
};
