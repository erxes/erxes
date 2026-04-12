import { useConfirm } from 'erxes-ui';
import { ITag, useTagRemove } from 'ui-modules';
import { useCallback } from 'react';

export const useTagDeleteConfirm = () => {
  const { confirm } = useConfirm();
  const { removeTag } = useTagRemove();

  const confirmDelete = useCallback(
    async (tag: ITag, childCount?: number) => {
      let message = `Delete "${tag.name}"?`;
      let description: string | undefined;

      if (tag.isGroup && childCount && childCount > 0) {
        message = `Delete group "${tag.name}"?`;
        description = `This group contains ${childCount} tag(s). All child tags will also be deleted.`;
      } else if (!tag.isGroup && (tag.objectCount ?? 0) > 0) {
        message = `Delete "${tag.name}"?`;
        description = `This tag is applied to ${tag.objectCount} item(s). It will be removed from all of them.`;
      }

      await confirm({ message, options: { description, okLabel: 'Delete' } });
      removeTag(tag._id);
    },
    [confirm, removeTag],
  );

  return { confirmDelete };
};
