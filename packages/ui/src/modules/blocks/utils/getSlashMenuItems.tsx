import { getDefaultReactSlashMenuItems } from '@blocknote/react';
import type { DefaultReactSuggestionItem } from '@blocknote/react';
import { filterSuggestionItems } from '@blocknote/core';
import { IconPhoto } from '@tabler/icons-react';
import type { BlockEditorProps } from 'erxes-ui/modules/blocks/types/TextEditor';

export const getSlashMenuItems = (
  query: string,
  editor: BlockEditorProps['editor'],
  additionalSlashMenuItems: BlockEditorProps['additionalSlashMenuItems'],
): Promise<DefaultReactSuggestionItem[]> => {
  // The default items include Image and Video: the custom blocks keep their `url` prop.
  const items = getDefaultReactSlashMenuItems(editor);

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
