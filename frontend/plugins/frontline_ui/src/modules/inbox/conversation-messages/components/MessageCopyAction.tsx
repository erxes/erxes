import { IconCheck, IconCopy } from '@tabler/icons-react';
import { Button, DropdownMenu } from 'erxes-ui';
import type { IAttachment } from 'erxes-ui';
import { ActionButton } from '@/inbox/conversation-messages/components/MessageActionButton';
import { CopyTextAction } from '@/inbox/conversation-messages/components/CopyTextAction';
import { useCopyMessageImage } from '@/inbox/conversation-messages/hooks/useCopyMessageImage';
import { canCopyAttachment } from '@/inbox/conversation-messages/utils/copyAttachment';

type Props = {
  text: string;
  attachment?: IAttachment;
  conversationId: string;
  messageId: string;
  inline: boolean;
};

export const MessageCopyAction = ({
  text,
  attachment,
  conversationId,
  messageId,
  inline,
}: Props) => {
  const canCopyImage = Boolean(attachment && canCopyAttachment(attachment));
  const { copied, copying, copy } = useCopyMessageImage({
    conversationId,
    messageId,
    url: attachment?.url || '',
  });

  if (!canCopyImage) {
    return text ? <CopyTextAction text={text} inline={inline} /> : null;
  }

  const imageIcon = copied ? (
    <IconCheck className="size-4 text-success" />
  ) : (
    <IconCopy className="size-4" />
  );
  const imageItem = (
    <DropdownMenu.Item
      disabled={copying}
      onSelect={(event) => {
        event.preventDefault();
        void copy();
      }}
    >
      {imageIcon}
      Copy image
    </DropdownMenu.Item>
  );

  if (!inline) {
    return (
      <>
        {text && <CopyTextAction text={text} inline={false} />}
        {imageItem}
      </>
    );
  }
  if (!text) {
    return (
      <ActionButton label="Copy image" onClick={copy} disabled={copying}>
        {imageIcon}
      </ActionButton>
    );
  }
  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Copy"
          className="size-8 rounded-md text-muted-foreground hover:bg-muted"
        >
          <IconCopy className="size-4" />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end">
        <CopyTextAction text={text} inline={false} />
        {imageItem}
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};
