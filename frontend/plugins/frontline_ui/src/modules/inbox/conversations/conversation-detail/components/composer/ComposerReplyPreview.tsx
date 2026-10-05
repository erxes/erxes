import { IconArrowBackUp, IconFile, IconX } from '@tabler/icons-react';
import { Button, readImage } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import type { MessageReplyTarget } from '../../states/messageReplyState';
import { PendingImage, PendingVideo } from './PendingAttachmentItem';

const ReplyAttachmentPreview = ({
  replyTo,
}: {
  replyTo: MessageReplyTarget;
}) => {
  const { attachment } = replyTo;

  if (!attachment?.url) return null;

  const source = readImage(attachment.url);
  const label = attachment.name || 'Reply attachment';

  if (attachment.type?.startsWith('image')) {
    return <PendingImage src={source} alt={label} />;
  }

  if (attachment.type?.startsWith('video')) {
    return <PendingVideo src={source} label={label} />;
  }

  return <IconFile className="size-4" />;
};

export const ComposerReplyPreview = ({
  replyTo,
  onCancel,
}: {
  replyTo: MessageReplyTarget;
  onCancel: () => void;
}) => {
  const { t } = useTranslation('frontline');

  return (
    <div className="flex h-8 min-w-0 items-center gap-2 border-l border-border/60 pl-3 text-xs text-muted-foreground">
      <IconArrowBackUp className="size-3.5 shrink-0" aria-hidden="true" />
      {replyTo.attachment?.url && (
        <span className="flex size-5 shrink-0 items-center justify-center overflow-hidden rounded">
          <ReplyAttachmentPreview replyTo={replyTo} />
        </span>
      )}
      <span
        className="max-w-[45%] shrink-0 truncate font-medium text-foreground/80"
        title={replyTo.authorName || t('message', 'message')}
      >
        {replyTo.nativeReply
          ? t('replying-to', 'Replying to:')
          : t('quoting', 'Quoting')}{' '}
        {replyTo.authorName || t('message', 'message')}
      </span>
      <span className="min-w-0 flex-1 truncate" title={replyTo.preview}>
        {replyTo.preview}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={t('cancel-reply', 'Cancel reply')}
        onClick={onCancel}
        className="size-6 shrink-0 rounded-full text-muted-foreground"
      >
        <IconX className="size-4" aria-hidden="true" />
      </Button>
    </div>
  );
};
