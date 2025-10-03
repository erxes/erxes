import { IconChevronLeft, IconChevronRight, IconX } from '@tabler/icons-react';

import { Button } from 'erxes-ui';
import { IAttachment } from '@/deals/types/attachments';
import { useAttachmentContext } from './AttachmentContext';
import { useDealsContext } from '@/deals/context/DealContext';

const FileAttachments = ({ attachments }: { attachments: IAttachment[] }) => {
  const { handleRemoveImage, removingUrl } = useAttachmentContext();
  const { loading } = useDealsContext();

  return (
    <div className="py-4 px-8">
      <h4 className="uppercase text-sm text-gray-500 pb-4">File Attachments</h4>
      <div className="relative">
        <div className="overflow-x-auto flex gap-4">
          {attachments.map((attachment) => (
            <div
              className="p-2 bg-indigo-100 text-indigo-600 rounded-md flex items-center gap-2 relative"
              key={attachment.url}
            >
              <a href={attachment.url}>{attachment.name}</a>
              <Button
                variant="ghost"
                disabled={loading && removingUrl === attachment.url}
                onClick={(e) => handleRemoveImage(e, attachment)}
                className="absolute top-0 right-[-10px] bg-red-400 hover:bg-red-600 text-white rounded-full p-1 w-6 h-6 shadow-md z-10"
                aria-label={`Remove image ${attachment.name}`}
              >
                <IconX size={12} />
              </Button>
            </div>
          ))}
        </div>
        <div className="absolute top-1/2 -left-4 transform -translate-y-1/2 hidden lg:block">
          <button
            className="bg-white p-1 rounded-full shadow"
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
            className="bg-white p-1 rounded-full shadow"
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
