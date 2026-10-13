import type { MailAttachmentInput } from '../types/mailDelivery';
import { IconPhoto, IconPaperclip } from '@tabler/icons-react';
import { Button, Input, toast } from 'erxes-ui';
import type { IBlockEditor } from 'erxes-ui';
import { useRef } from 'react';
import type { ComponentType } from 'react';

const ToolButton = ({
  label,
  icon: Icon,
  onClick,
  disabled = false,
}: {
  label: string;
  icon: ComponentType<{ className?: string }>;
  onClick: () => void;
  disabled?: boolean;
}) => (
  <Button
    type="button"
    variant="ghost"
    size="icon"
    className="size-7 rounded-sm"
    title={label}
    aria-label={label}
    disabled={disabled}
    onMouseDown={(event) => event.preventDefault()}
    onClick={onClick}
  >
    <Icon className="size-4" />
  </Button>
);

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
