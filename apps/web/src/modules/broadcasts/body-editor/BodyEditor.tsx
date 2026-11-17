import { filterSuggestionItems } from '@blocknote/core';
import {
  BasicTextStyleButton,
  BlockTypeSelect,
  ComponentsContext,
  CreateLinkButton,
  FormattingToolbar,
  FormattingToolbarController,
  getDefaultReactSlashMenuItems,
  SuggestionMenuController,
  useCreateBlockNote,
  type DefaultReactSuggestionItem,
} from '@blocknote/react';
import { BlockNoteView } from '@blocknote/shadcn';
import { BROADCAST_PLACEHOLDERS, type BroadcastPlaceholder } from '@erxes/core-contract';
import { IconBraces } from '@tabler/icons-react';
import { SlashMenu } from 'erxes-ui/modules/blocks/components/SlashMenu';
import { editorUIComponents } from 'erxes-ui/modules/blocks/constant/toolbar/editorUIComponents';
import { useToolbarComponents } from 'erxes-ui/modules/blocks/hooks/toolbar/useToolbarComponents';
import { themeState } from 'erxes-ui/state/themeState';
import { useAtomValue } from 'jotai';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LabelRow } from '../PlaceholderMenu';
import { blocksToMarkdown, markdownToBlocks } from './markdown';
import { BODY_SCHEMA, type BodyEditor as Editor } from './schema';

/** Bold, italic, strike-through and links: what Markdown keeps. */
const Toolbar = () => {
  const components = useToolbarComponents();

  if (!components) return null;

  return (
    <ComponentsContext.Provider value={components}>
      <FormattingToolbar>
        <BlockTypeSelect />
        <BasicTextStyleButton basicTextStyle="bold" />
        <BasicTextStyleButton basicTextStyle="italic" />
        <BasicTextStyleButton basicTextStyle="strike" />
        <CreateLinkButton />
      </FormattingToolbar>
    </ComponentsContext.Provider>
  );
};

const insertField = (editor: Editor, name: BroadcastPlaceholder) => {
  editor.focus();
  editor.insertInlineContent([{ type: 'field', props: { name, fallback: '' } }]);
};

/**
 * The email's message as blocks: "/" adds headings, lists and pictures, "{" or
 * Insert a field adds a customer's value as a chip. Kept as Markdown, which core
 * renders and sends, so a reload shows what was saved.
 */
export const BodyEditor = ({
  value,
  onChange,
  label,
  placeholder,
}: {
  value: string;
  onChange: (markdown: string) => void;
  label: string;
  placeholder: string;
}) => {
  const { t } = useTranslation('broadcasts');
  const theme = useAtomValue(themeState);

  // Read once: the body only changes here, so the saved Markdown is the start.
  const [initialContent] = useState(() => {
    const blocks = markdownToBlocks(value);

    return blocks.length ? blocks : undefined;
  });

  const editor = useCreateBlockNote({
    schema: BODY_SCHEMA,
    initialContent,
    placeholders: { default: placeholder, emptyDocument: placeholder },
    domAttributes: { editor: { role: 'combobox', 'aria-expanded': 'false', 'aria-label': label } },
  });

  const fieldItems = (): DefaultReactSuggestionItem[] =>
    BROADCAST_PLACEHOLDERS.map((name) => ({
      title: t(`placeholder.${name}`, name),
      aliases: [name],
      group: t('fields', 'Fields'),
      icon: <IconBraces size={18} />,
      onItemClick: () => insertField(editor, name),
    }));

  return (
    <div className="space-y-1.5">
      <LabelRow label={label} onPick={(name) => insertField(editor, name)} />
      <div className="erxes-blocknote min-h-64 rounded-md pt-1 text-sm shadow-xs focus-within:shadow-focus">
        <BlockNoteView
          editor={editor}
          theme={theme === 'system' ? undefined : theme}
          slashMenu={false}
          formattingToolbar={false}
          tableHandles={false}
          comments={false}
          shadCNComponents={editorUIComponents}
          onChange={() => onChange(blocksToMarkdown(editor))}
        >
          <FormattingToolbarController formattingToolbar={Toolbar} />
          <SuggestionMenuController
            triggerCharacter="/"
            suggestionMenuComponent={SlashMenu}
            getItems={(query) =>
              Promise.resolve(
                filterSuggestionItems(
                  [
                    ...getDefaultReactSlashMenuItems(editor).filter(
                      ({ title }) => title !== editor.dictionary.slash_menu.emoji.title,
                    ),
                    ...fieldItems(),
                  ],
                  query,
                ),
              )
            }
          />
          <SuggestionMenuController
            triggerCharacter="{"
            suggestionMenuComponent={SlashMenu}
            getItems={(query) => Promise.resolve(filterSuggestionItems(fieldItems(), query))}
          />
        </BlockNoteView>
      </div>
    </div>
  );
};
