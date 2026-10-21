import { IconX } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useCreateTicket } from '@/ticket/hooks/useCreateTicket';
import { useUnverifiedAttachments } from '@/ticket/hooks/useUnverifiedAttachments';
import { IAttachment } from '@/ticket/types/attachments';
import { useAttachmentContext } from './AttachmentContext';
import { UnverifiedAttachmentCover } from './UnverifiedAttachmentCover';

export const AudioAttachments = ({
  attachments,
}: {
  attachments: IAttachment[];
}) => {
  const { t } = useTranslation('frontline');
  const { handleRemoveImage, removingUrl } = useAttachmentContext();
  const { loading } = useCreateTicket();
  const { isCovered, reveal } = useUnverifiedAttachments();

  return (
    <div className="py-4 px-8">
      <h4 className="uppercase text-sm text-muted-foreground pb-4">
        {t('audio-attachments', 'Audio Attachments')}
      </h4>
      <div className="flex flex-col gap-3">
        {attachments.map((attachment) => (
          <div
            className="relative flex min-h-12 items-center gap-2 rounded-lg border border-border p-2"
            key={attachment.url}
          >
            {isCovered(attachment.url) ? (
              <UnverifiedAttachmentCover
                onReveal={() => reveal(attachment.url)}
              />
            ) : (
              <audio
                className="w-full"
                src={attachment.url}
                controls
                preload="none"
              />
            )}
            <Button
              variant="ghost"
              disabled={loading && removingUrl === attachment.url}
              onClick={(e) => handleRemoveImage(e, attachment)}
              className="absolute top-0 right-[-10px] bg-destructive hover:bg-destructive/80 text-background rounded-full p-1 w-6 h-6 shadow-md z-10"
              aria-label={`Remove audio ${attachment.name}`}
            >
              <IconX size={12} />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
