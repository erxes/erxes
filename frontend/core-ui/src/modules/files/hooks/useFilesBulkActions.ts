import { useConfirm } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { filesCanManage } from 'ui-modules';
import { useFilesPage } from '../context/FilesPageContext';
import { useFilesActions } from './useFilesActions';
import { useFilesPins } from './useFilesPins';

export const useFilesBulkActions = () => {
  const { t } = useTranslation('files');
  const { confirm } = useConfirm();
  const page = useFilesPage();
  const { selection } = page;
  const { remove } = useFilesActions();
  const pins = useFilesPins();
  const ids = { fileIds: selection.fileIds, folderIds: selection.folderIds };
  const canManageAll = selection.items.every(({ item }) =>
    filesCanManage(item.myRole),
  );
  const folders = selection.items.flatMap((i) =>
    i.itemType === 'folder' ? [i.item] : [],
  );
  const unpinned = selection.items.filter(
    ({ item }) => !pins.isPinned(item._id),
  ).length;

  return {
    open: !!selection.count,
    count: selection.count,
    clear: selection.clear,
    canManageAll,
    canAppearance: canManageAll && folders.length === selection.count,
    canPin: !!unpinned && pins.canPin(unpinned),
    pinBlockedByLimit: !!unpinned && !pins.canPin(unpinned),
    move: () =>
      page.setMoveTarget({
        ...ids,
        label: t('items-count', { count: selection.count }),
      }),
    share: () => page.setBulkShareOpen(true),
    appearance: () => page.setAppearanceFolders(folders),
    pin: async () => {
      const result = await pins.pinMany(ids);

      if (!result.errors) {
        selection.clear();
      }
    },
    trash: () =>
      confirm({
        message: t('trash-many-confirm', { count: selection.count }),
      }).then(async () => {
        const result = await remove(ids);

        if (!result.errors) {
          selection.clear();
        }
      }),
  };
};
