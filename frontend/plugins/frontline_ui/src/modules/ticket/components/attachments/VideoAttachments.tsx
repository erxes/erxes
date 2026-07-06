import { Button } from 'erxes-ui';
import { IconX } from '@tabler/icons-react';

import { IAttachment } from '@/ticket/types/attachments';
import { useAttachmentContext } from './AttachmentContext';
import { useCreateTicket } from '@/ticket/hooks/useCreateTicket';


const getCloudflareStreamIframe = (url: string): string | null => {
  const match = url.match(
    /^(https:\/\/customer-[^/]+\.cloudflarestream\.com\/[^/]+)/,
  );

  return match ? `${match[1]}/iframe` : null;
};

const VideoAttachments = ({ attachments }: { attachments: IAttachment[] }) => {
  const { handleRemoveImage, removingUrl } = useAttachmentContext();
  const { loading } = useCreateTicket();

  return (
    <div className="py-4 px-8">
      <h4 className="uppercase text-sm text-muted-foreground pb-4">
        Video Attachments
      </h4>
      <div className="overflow-x-auto flex gap-4">
        {attachments.map((attachment) => {
          const iframeSrc = getCloudflareStreamIframe(attachment.url);

          return (
            <div
              className="group relative w-64 aspect-video rounded-lg border border-border shadow-md shrink-0 overflow-hidden bg-black"
              key={attachment.url}
            >
              {iframeSrc ? (
                <iframe
                  className="w-full h-full"
                  src={iframeSrc}
                  title={attachment.name}
                  allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                  allowFullScreen
                />
              ) : (
                <video
                  className="w-full h-full object-contain"
                  src={attachment.url}
                  controls
                />
              )}

              <Button
                variant="ghost"
                disabled={loading && removingUrl === attachment.url}
                onClick={(e) => handleRemoveImage(e, attachment)}
                className="absolute top-0 right-[-10px] bg-destructive hover:bg-destructive/80 text-background rounded-full p-1 w-6 h-6 shadow-md z-10"
                aria-label={`Remove video ${attachment.name}`}
              >
                <IconX size={12} />
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VideoAttachments;
