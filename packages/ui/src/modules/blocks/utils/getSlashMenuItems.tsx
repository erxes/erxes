import { getDefaultReactSlashMenuItems } from '@blocknote/react';
import type { DefaultReactSuggestionItem } from '@blocknote/react';
import { filterSuggestionItems } from '@blocknote/core';
import { IconPhoto } from '@tabler/icons-react';
import type { BlockEditorProps } from 'erxes-ui/modules/blocks/types';

export const getSlashMenuItems = (
  query: string,
  editor: BlockEditorProps['editor'],
  additionalSlashMenuItems: BlockEditorProps['additionalSlashMenuItems'],
): Promise<DefaultReactSuggestionItem[]> => {
  const items = getDefaultReactSlashMenuItems(editor);
  const hasImageItem = items.some((item) => item.title === 'Image');
  const hasCustomImageBlock = 'image' in editor.schema.blockSchema;
  const filePanelPlugin = editor.filePanel?.plugins[0];

  if (!hasImageItem && hasCustomImageBlock && filePanelPlugin) {
    items.splice(9, 0, {
      title: editor.dictionary.slash_menu.image.title,
      subtext: editor.dictionary.slash_menu.image.subtext,
      aliases: editor.dictionary.slash_menu.image.aliases,
      badge: undefined,
      group: editor.dictionary.slash_menu.image.group,
      onItemClick: () => {
        const currentBlock = editor.getTextCursorPosition().block;
        const insertedBlock = editor.insertBlocks(
          [{ type: 'image' }],
          currentBlock,
          'after',
        )[0];

        editor.transact((tr) =>
          tr.setMeta(filePanelPlugin, {
            block: insertedBlock,
          }),
        );
      },
    } satisfies DefaultReactSuggestionItem);
  }

  if ('gallery' in editor.schema.blockSchema) {
    items.push({
      title: 'Gallery',
      subtext: 'Insert a multi-image gallery grid',
      aliases: ['gallery', 'images', 'grid'],
      badge: undefined,
      group: editor.dictionary.slash_menu.image.group,
      icon: <IconPhoto size={18} />,
      onItemClick: () => {
        const currentBlock = editor.getTextCursorPosition().block;
        editor.insertBlocks([{ type: 'gallery' }], currentBlock, 'after');
      },
    } satisfies DefaultReactSuggestionItem);
  }

  const customItems =
    typeof additionalSlashMenuItems === 'function'
      ? additionalSlashMenuItems(editor)
      : additionalSlashMenuItems;

  if (customItems?.length) {
    items.push(...customItems);
  }

  return Promise.resolve(filterSuggestionItems(items, query));
};
