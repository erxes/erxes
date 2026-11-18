import { getDefaultReactSlashMenuItems } from '@blocknote/react';
import type { DefaultReactSuggestionItem } from '@blocknote/react';
import { filterSuggestionItems } from '@blocknote/core';
import { IconLayoutGrid } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { BlockEditorProps } from 'erxes-ui/modules/blocks/types/TextEditor';

/** The slash menu's items for a query: BlockNote's, the gallery, then the caller's own. */
export const useSlashMenuItems = (
  editor: BlockEditorProps['editor'],
  additionalSlashMenuItems: BlockEditorProps['additionalSlashMenuItems'],
) => {
  const { t } = useTranslation('ui', { keyPrefix: 'editor' });

  return (query: string): Promise<DefaultReactSuggestionItem[]> => {
    // The default items include Image and Video: the custom blocks keep their `url` prop.
    const items = getDefaultReactSlashMenuItems(editor);

    if ('gallery' in editor.schema.blockSchema) {
      items.push({
        title: t('gallery', 'Gallery'),
        subtext: t('gallery-hint', 'Insert a multi-image gallery grid'),
        aliases: ['gallery', 'images', 'grid'],
        badge: undefined,
        group: editor.dictionary.slash_menu.image.group,
        icon: <IconLayoutGrid />,
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
};
