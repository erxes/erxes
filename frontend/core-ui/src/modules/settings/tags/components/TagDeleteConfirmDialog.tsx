import { useConfirm } from 'erxes-ui';
import { ITag, useTagRemove } from 'ui-modules';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export const useTagDeleteConfirm = () => {
  const { confirm } = useConfirm();
  const { removeTag } = useTagRemove();
  const { t } = useTranslation('settings', { keyPrefix: 'tags' });

  const confirmDelete = useCallback(
    async (tag: ITag, childCount?: number) => {
      let message = t('delete-confirm', { name: tag.name });
      let description: string | undefined;

      if (tag.isGroup && childCount && childCount > 0) {
        message = t('delete-group-confirm', { name: tag.name });
        description = t('delete-group-confirm-description', {
          count: childCount,
        });
      } else if (!tag.isGroup && (tag.objectCount ?? 0) > 0) {
        description = t('delete-tag-confirm-description', {
          count: tag.objectCount,
        });
      }

      await confirm({
        message,
        options: { description, okLabel: t('delete') },
      });
      removeTag(tag._id);
    },
    [confirm, removeTag, t],
  );

  return { confirmDelete };
};
