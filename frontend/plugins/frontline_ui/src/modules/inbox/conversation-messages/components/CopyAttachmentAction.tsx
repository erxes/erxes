import { attachmentName } from '@/inbox/conversation-messages/utils/attachmentName';
import { IconCheck, IconCopy } from '@tabler/icons-react';
import { DropdownMenu } from 'erxes-ui';
import type { IAttachment } from 'erxes-ui';
import { ActionButton } from '@/inbox/conversation-messages/components/MessageActionButton';
import { useCopyAttachment } from '@/inbox/conversation-messages/hooks/useCopyAttachment';

export const CopyAttachmentAction = ({
  attachment,
  inline,
}: {
  attachment: IAttachment;
  inline: boolean;
}) => {
  const { copied, copying, copy } = useCopyAttachment(attachment);
  const label = `Copy ${attachmentName(attachment) || 'attachment'}`;
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
