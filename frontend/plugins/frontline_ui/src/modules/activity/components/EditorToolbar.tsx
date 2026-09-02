import {
  IconBold,
  IconItalic,
  IconList,
  IconListNumbers,
  IconPhoto,
  IconStrikethrough,
  IconUnderline,
} from '@tabler/icons-react';
import { Button, Separator, Tooltip, useBlockEditor } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

type BlockEditorInstance = ReturnType<typeof useBlockEditor>;

const ToolbarButton = ({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <Tooltip>
    <Tooltip.Trigger asChild>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-7"
        aria-label={label}
        onMouseDown={(event) => event.preventDefault()}
        onClick={onClick}
      >
        {children}
      </Button>
    </Tooltip.Trigger>
    <Tooltip.Content>{label}</Tooltip.Content>
  </Tooltip>
);

export const EditorToolbar = ({ editor }: { editor: BlockEditorInstance }) => {
  const { t } = useTranslation('frontline');

  // Clicking the list type that is already applied returns the block to a
  // paragraph, matching how BlockNote's own toolbar behaves.
  const toggleBlockType = (type: 'bulletListItem' | 'numberedListItem') => {
    const block = editor.getTextCursorPosition()?.block;
    if (!block) return;

    editor.updateBlock(block, {
      type: block.type === type ? 'paragraph' : type,
    });
  };

  const insertImage = () => {
    const currentBlock = editor.getTextCursorPosition()?.block;
    if (!currentBlock) return;

    const insertedBlock = editor.insertBlocks(
      [{ type: 'image' }],
      currentBlock,
      'after',
    )[0];

    const filePanel = editor.filePanel;
    if (filePanel) {
      editor.transact((tr) =>
        tr.setMeta(filePanel.plugins[0], { block: insertedBlock }),
      );
    }
  };

  return (
    <div className="flex items-center gap-0.5 pb-1">
      <ToolbarButton
        label={t('bold', 'Bold')}
        onClick={() => editor.toggleStyles({ bold: true })}
      >
        <IconBold className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label={t('italic', 'Italic')}
        onClick={() => editor.toggleStyles({ italic: true })}
      >
        <IconItalic className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label={t('underline', 'Underline')}
        onClick={() => editor.toggleStyles({ underline: true })}
      >
        <IconUnderline className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label={t('strikethrough', 'Strikethrough')}
        onClick={() => editor.toggleStyles({ strike: true })}
      >
        <IconStrikethrough className="size-4" />
      </ToolbarButton>

      <Separator.Inline className="mx-1 h-4" />

      <ToolbarButton
        label={t('bulleted-list', 'Bulleted list')}
        onClick={() => toggleBlockType('bulletListItem')}
      >
        <IconList className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label={t('numbered-list', 'Numbered list')}
        onClick={() => toggleBlockType('numberedListItem')}
      >
        <IconListNumbers className="size-4" />
      </ToolbarButton>

      <Separator.Inline className="mx-1 h-4" />

      <ToolbarButton label={t('image', 'Image')} onClick={insertImage}>
        <IconPhoto className="size-4" />
      </ToolbarButton>
    </div>
  );
};
