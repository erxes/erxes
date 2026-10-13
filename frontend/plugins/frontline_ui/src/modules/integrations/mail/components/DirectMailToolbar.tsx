import type { MailAttachmentInput } from '../types/mailDelivery';
import {
  IconArrowBackUp,
  IconArrowForwardUp,
  IconBold,
  IconItalic,
  IconUnderline,
  IconAlignLeft,
  IconAlignCenter,
  IconAlignRight,
  IconList,
  IconListNumbers,
  IconIndentIncrease,
  IconIndentDecrease,
  IconClearFormatting,
  IconLink,
  IconPhoto,
  IconPaperclip,
  IconMoodSmile,
} from '@tabler/icons-react';
import { Button, Input, Popover, Select, toast } from 'erxes-ui';
import type { IBlockEditor } from 'erxes-ui';
import { useEffect, useRef, useState } from 'react';
import type { ComponentType } from 'react';

const ToolButton = ({
  label,
  icon: Icon,
  onClick,
  active = false,
  disabled = false,
}: {
  label: string;
  icon: ComponentType<{ className?: string }>;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
}) => (
  <Button
    type="button"
    variant="ghost"
    size="icon"
    className="size-7 rounded-sm aria-pressed:bg-accent"
    title={label}
    aria-label={label}
    aria-pressed={active}
    disabled={disabled}
    onMouseDown={(event) => event.preventDefault()}
    onClick={onClick}
  >
    <Icon className="size-4" />
  </Button>
);

export const DirectMailFormatting = ({
  editor,
  disabled,
}: {
  editor: IBlockEditor;
  disabled: boolean;
}) => {
  const [styles, setStyles] = useState(() => editor.getActiveStyles());
  useEffect(
    () => editor.onSelectionChange(() => setStyles(editor.getActiveStyles())),
    [editor],
  );
  useEffect(
    () => editor.onChange(() => setStyles(editor.getActiveStyles())),
    [editor],
  );
  const updateBlocks = (
    type: 'paragraph' | 'bulletListItem' | 'numberedListItem',
  ) => {
    const blocks = editor.getSelection()?.blocks || [
      editor.getTextCursorPosition().block,
    ];
    blocks.forEach((block) => {
      if (Array.isArray(block.content)) editor.updateBlock(block, { type });
    });
    editor.focus();
  };
  const align = (textAlignment: 'left' | 'center' | 'right') => {
    const blocks = editor.getSelection()?.blocks || [
      editor.getTextCursorPosition().block,
    ];
    blocks.forEach((block) => {
      if ('textAlignment' in block.props)
        editor.updateBlock(block, { props: { textAlignment } });
    });
    editor.focus();
  };
  return (
    <fieldset
      disabled={disabled}
      aria-label="Formatting options"
      className="flex w-fit max-w-full flex-wrap items-center gap-0.5 rounded bg-muted px-2 py-1 text-foreground"
    >
      <ToolButton
        label="Undo"
        icon={IconArrowBackUp}
        onClick={() => {
          editor.undo();
          editor.focus();
        }}
      />
      <ToolButton
        label="Redo"
        icon={IconArrowForwardUp}
        onClick={() => {
          editor.redo();
          editor.focus();
        }}
      />
      <Select
        value={styles.fontFamily || 'Arial, sans-serif'}
        onValueChange={(fontFamily) => {
          editor.addStyles({ fontFamily });
          editor.focus();
        }}
      >
        <Select.Trigger
          aria-label="Font"
          className="h-7 w-28 border-0 bg-transparent px-2 shadow-none"
        >
          <Select.Value />
        </Select.Trigger>
        <Select.Content>
          <Select.Item value="Arial, sans-serif">Sans Serif</Select.Item>
          <Select.Item value="Georgia, serif">Serif</Select.Item>
          <Select.Item value="monospace">Monospace</Select.Item>
        </Select.Content>
      </Select>
      <ToolButton
        label="Bold"
        icon={IconBold}
        active={Boolean(styles.bold)}
        onClick={() => {
          editor.toggleStyles({ bold: true });
          editor.focus();
        }}
      />
      <ToolButton
        label="Italic"
        icon={IconItalic}
        active={Boolean(styles.italic)}
        onClick={() => {
          editor.toggleStyles({ italic: true });
          editor.focus();
        }}
      />
      <ToolButton
        label="Underline"
        icon={IconUnderline}
        active={Boolean(styles.underline)}
        onClick={() => {
          editor.toggleStyles({ underline: true });
          editor.focus();
        }}
      />
      <Input
        type="color"
        aria-label="Text color"
        title="Text color"
        value={styles.textColor?.startsWith('#') ? styles.textColor : '#000000'}
        className="h-7 w-7 cursor-pointer border-0 bg-transparent p-1"
        onChange={(event) => {
          editor.addStyles({ textColor: event.target.value });
          editor.focus();
        }}
      />
      <ToolButton
        label="Align left"
        icon={IconAlignLeft}
        onClick={() => align('left')}
      />
      <ToolButton
        label="Align center"
        icon={IconAlignCenter}
        onClick={() => align('center')}
      />
      <ToolButton
        label="Align right"
        icon={IconAlignRight}
        onClick={() => align('right')}
      />
      <ToolButton
        label="Numbered list"
        icon={IconListNumbers}
        onClick={() => updateBlocks('numberedListItem')}
      />
      <ToolButton
        label="Bulleted list"
        icon={IconList}
        onClick={() => updateBlocks('bulletListItem')}
      />
      <ToolButton
        label="Decrease indent"
        icon={IconIndentDecrease}
        disabled={!editor.canUnnestBlock()}
        onClick={() => {
          editor.unnestBlock();
          editor.focus();
        }}
      />
      <ToolButton
        label="Increase indent"
        icon={IconIndentIncrease}
        disabled={!editor.canNestBlock()}
        onClick={() => {
          editor.nestBlock();
          editor.focus();
        }}
      />
      <ToolButton
        label="Remove formatting"
        icon={IconClearFormatting}
        onClick={() => {
          editor.removeStyles(editor.getActiveStyles());
          updateBlocks('paragraph');
        }}
      />
    </fieldset>
  );
};

export const DirectMailInsertTools = ({
  editor,
  disabled,
  onUploadingChange,
  onAttachment,
}: {
  editor: IBlockEditor;
  disabled: boolean;
  onUploadingChange: (uploading: boolean) => void;
  onAttachment: (attachment: MailAttachmentInput) => void;
}) => {
  const fileInput = useRef<HTMLInputElement>(null);
  const attachmentInput = useRef<HTMLInputElement>(null);
  const [linkOpen, setLinkOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [linkError, setLinkError] = useState('');
  const addLink = () => {
    try {
      const parsed = new URL(url);
      if (!['http:', 'https:', 'mailto:'].includes(parsed.protocol))
        throw new Error('Enter an http, https or mailto link');
      editor.createLink(parsed.href, editor.getSelectedText() || url);
      setLinkOpen(false);
      setUrl('');
      setLinkError('');
      editor.focus();
    } catch {
      setLinkError('Enter a valid http, https or mailto link');
    }
  };
  return (
    <>
      <ToolButton
        label="Attach files"
        icon={IconPaperclip}
        disabled={disabled}
        onClick={() => attachmentInput.current?.click()}
      />
      <Input
        ref={attachmentInput}
        type="file"
        className="hidden"
        aria-label="Upload attachment"
        disabled={disabled}
        onChange={async (event) => {
          const file = event.target.files?.[0];
          event.target.value = '';
          if (!file || !editor.uploadFile) return;
          onUploadingChange(true);
          try {
            const uploaded = await editor.uploadFile(file);
            if (typeof uploaded !== 'string')
              throw new Error('Unable to upload attachment');
            onAttachment({
              url: uploaded,
              name: file.name,
              type: file.type,
              size: file.size,
              disposition: 'attachment',
            });
          } catch (error) {
            toast({
              title: 'Attachment upload failed',
              description: error instanceof Error ? error.message : 'Try again',
              variant: 'destructive',
            });
          } finally {
            onUploadingChange(false);
          }
        }}
      />
      <Popover open={linkOpen} onOpenChange={setLinkOpen}>
        <Popover.Trigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8"
            title="Insert link"
            aria-label="Insert link"
            disabled={disabled}
            onMouseDown={(event) => event.preventDefault()}
          >
            <IconLink className="size-4" />
          </Button>
        </Popover.Trigger>
        <Popover.Content className="z-60 space-y-2" side="top">
          <Input
            aria-label="Link URL"
            placeholder="https://"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                addLink();
              }
            }}
          />
          {linkError && (
            <p role="alert" className="text-xs text-destructive">
              {linkError}
            </p>
          )}
          <Button type="button" size="sm" onClick={addLink}>
            Insert link
          </Button>
        </Popover.Content>
      </Popover>
      <Popover>
        <Popover.Trigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8"
            title="Insert emoji"
            aria-label="Insert emoji"
            disabled={disabled}
            onMouseDown={(event) => event.preventDefault()}
          >
            <IconMoodSmile className="size-4" />
          </Button>
        </Popover.Trigger>
        <Popover.Content className="z-60 flex w-auto gap-1" side="top">
          {['😀', '😊', '👍', '❤️', '🎉', '🙏'].map((emoji) => (
            <Button
              key={emoji}
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Insert ${emoji}`}
              onClick={() => {
                editor.insertInlineContent(emoji);
                editor.focus();
              }}
            >
              {emoji}
            </Button>
          ))}
        </Popover.Content>
      </Popover>
      <ToolButton
        label="Insert image"
        icon={IconPhoto}
        disabled={disabled}
        onClick={() => fileInput.current?.click()}
      />
      <Input
        ref={fileInput}
        type="file"
        accept="image/*"
        className="hidden"
        aria-label="Upload image"
        disabled={disabled}
        onChange={async (event) => {
          const file = event.target.files?.[0];
          event.target.value = '';
          if (!file || !editor.uploadFile) return;
          onUploadingChange(true);
          try {
            const uploaded = await editor.uploadFile(file);
            if (typeof uploaded !== 'string')
              throw new Error('Unable to upload image');
            editor.insertBlocks(
              [{ type: 'image', props: { url: uploaded, name: file.name } }],
              editor.getTextCursorPosition().block,
              'after',
            );
            editor.focus();
          } catch (error) {
            toast({
              title: 'Image upload failed',
              description: error instanceof Error ? error.message : 'Try again',
              variant: 'destructive',
            });
          } finally {
            onUploadingChange(false);
          }
        }}
      />
    </>
  );
};
