import { IconCheck, IconCopy } from '@tabler/icons-react';
import { Button, CopyText, DropdownMenu } from 'erxes-ui';
import type { IAttachment } from 'erxes-ui';
import { ActionButton } from '@/inbox/conversation-messages/components/MessageActionButton';
import { useCopyMessageImage } from '@/inbox/conversation-messages/hooks/useCopyMessageImage';

type Props = {
  text: string;
  attachment?: IAttachment;
  conversationId: string;
  messageId: string;
  isInstagram: boolean;
  inline: boolean;
};

export const MessageCopyAction = ({
  text, attachment, conversationId, messageId, isInstagram, inline,
}: Props) => {
  const canCopyImage = Boolean(
    attachment?.url &&
      typeof navigator !== 'undefined' &&
      navigator.clipboard?.write &&
      typeof ClipboardItem !== 'undefined' &&
      (!ClipboardItem.supports || ClipboardItem.supports('image/png')),
  );
  const { copied, copying, copy } = useCopyMessageImage({
    conversationId,
    messageId,
    url: attachment?.url || '',
    isInstagram,
  });
  if (!text && !canCopyImage) return null;

  const imageItem = (
    <DropdownMenu.Item
      disabled={copying}
      onSelect={(event) => {
        event.preventDefault();
        void copy();
      }}
    >
      {copied ? <IconCheck className="size-4" /> : <IconCopy className="size-4" />}
      Copy image
    </DropdownMenu.Item>
  );
  const textItem = (
    <DropdownMenu.Item asChild>
      <CopyText value={text} className="w-full">
        <IconCopy className="size-4" />
        Copy text
      </CopyText>
    </DropdownMenu.Item>
  );

  if (inline && text && canCopyImage) {
    return (
      <DropdownMenu>
        <DropdownMenu.Trigger asChild>
          <Button type="button" variant="ghost" size="icon" aria-label="Copy" className="size-8 rounded-md text-muted-foreground hover:bg-muted">
            <IconCopy className="size-4" />
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="end">
          {textItem}
          {imageItem}
        </DropdownMenu.Content>
      </DropdownMenu>
    );
  }
  if (inline && canCopyImage) {
    return (
      <ActionButton label="Copy image" onClick={copy} disabled={copying}>
        {copied ? <IconCheck className="size-4 text-success" /> : <IconCopy className="size-4" />}
      </ActionButton>
    );
  }
  if (inline) {
    return (
      <CopyText value={text} className="size-8 justify-center rounded-md text-muted-foreground hover:bg-muted [&>span]:gap-0 [&>span]:text-[0px]">
        <IconCopy className="size-4" />
        <span className="sr-only">Copy text</span>
      </CopyText>
    );
  }
  if (text && canCopyImage) {
    return <>{textItem}{imageItem}</>;
  }
  return canCopyImage ? imageItem : textItem;
};
