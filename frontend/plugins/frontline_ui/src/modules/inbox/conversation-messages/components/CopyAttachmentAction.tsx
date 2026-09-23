import { IconCheck, IconCopy } from '@tabler/icons-react';
import { DropdownMenu } from 'erxes-ui';
import type { IAttachment } from 'erxes-ui';
import { ActionButton } from '@/inbox/conversation-messages/components/MessageActionButton';
import { useCopyAttachment } from '@/inbox/conversation-messages/hooks/useCopyAttachment';
import { canCopyAttachment } from '@/inbox/conversation-messages/utils/copyAttachment';

export const CopyAttachmentAction = ({
  attachment,
  inline,
}: {
  attachment: IAttachment;
  inline: boolean;
}) => {
  const { copied, copying, copy } = useCopyAttachment(attachment);
  if (!canCopyAttachment(attachment)) return null;
  const isImage =
    attachment.type?.startsWith('image') || attachment.type === 'sticker';
  const label = isImage ? 'Copy image' : 'Copy attachment';
  const icon = copied ? (
    <IconCheck className="size-4 text-success" />
  ) : (
    <IconCopy className="size-4" />
  );
  if (inline) {
    return (
      <ActionButton
        label={label}
        disabled={copying || !attachment.url}
        onClick={copy}
      >
        {icon}
      </ActionButton>
    );
  }
  return (
    <DropdownMenu.Item
      disabled={copying || !attachment.url}
      onSelect={(event) => {
        event.preventDefault();
        void copy();
      }}
    >
      {icon}
      {label}
    </DropdownMenu.Item>
  );
};
