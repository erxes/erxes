import { IconChevronLeft, IconChevronRight, IconX } from '@tabler/icons-react';

import { Button } from 'erxes-ui';
import { useAttachmentContext } from './AttachmentContext';
import { IAttachment } from '@/ticket/types/attachments';
import { useCreateTicket } from '@/ticket/hooks/useCreateTicket';

const FileAttachments = ({ attachments }: { attachments: IAttachment[] }) => {
  const { handleRemoveImage, removingUrl } = useAttachmentContext();
  const { loading } = useCreateTicket();

  return (
    <div className="py-4 px-8">
      <h4 className="uppercase text-sm text-muted-foreground pb-4">
        File Attachments
      </h4>
      <div className="relative">
        <div className="overflow-x-auto flex gap-4">
          {attachments.map((attachment) => (
            <div
              className="p-2 bg-background text-primary rounded-md flex items-center gap-2 relative"
              key={attachment.url}
            >
              <a href={attachment.url}>{attachment.name}</a>
              <Button
                variant="ghost"
                disabled={loading && removingUrl === attachment.url}
                onClick={(e) => handleRemoveImage(e, attachment)}
                className="absolute top-0 right-[-10px] bg-destructive hover:bg-destructive/80 text-background rounded-full p-1 w-6 h-6 shadow-md z-10"
                aria-label={`Remove image ${attachment.name}`}
              >
                <IconX size={12} />
              </Button>
            </div>
          ))}
        </div>
        <div className="absolute top-1/2 -left-4 transform -translate-y-1/2 hidden lg:block">
          <button
            className="bg-background p-1 rounded-full shadow"
            onClick={() => {
              document.querySelector('.scrollable-media')?.scrollBy({
                left: -150,
                behavior: 'smooth',
              });
            }}
          >
            <IconChevronLeft size={20} />
          </button>
        </div>

        <div className="absolute top-1/2 -right-4 transform -translate-y-1/2 hidden lg:block">
          <button
            className="bg-background p-1 rounded-full shadow"
            onClick={() => {
              document.querySelector('.scrollable-media')?.scrollBy({
                left: 150,
                behavior: 'smooth',
              });
            }}
          >
            <IconChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileAttachments;
