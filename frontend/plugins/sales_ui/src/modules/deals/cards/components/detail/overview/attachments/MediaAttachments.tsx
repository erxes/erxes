import { Button, Dialog, Spinner, cn, readImage } from 'erxes-ui';
import {
  IconChevronLeft,
  IconChevronRight,
  IconX,
  IconZoomIn,
} from '@tabler/icons-react';
import { useEffect, useRef, useState } from 'react';

import { IAttachment } from '@/deals/types/attachments';
import { useAttachmentContext } from './AttachmentContext';
import { useDealsContext } from '@/deals/context/DealContext';
import { useTranslation } from 'react-i18next';

export const MediaAttachments = ({
  attachments,
}: {
  attachments: IAttachment[];
}) => {
  const [open, setOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { loading } = useDealsContext();
  const { handleRemoveImage, removingUrl } = useAttachmentContext();

  const currentAttachment = attachments[currentIndex];

  const { t } = useTranslation('sales');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;

      if (e.key === 'ArrowRight') {
        setCurrentIndex((prev) => (prev + 1) % attachments.length);
      }
      if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) =>
          prev === 0 ? attachments.length - 1 : prev - 1,
        );
      }
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, attachments.length]);

  return (
    <div className="relative px-8">
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {attachments.map((attachment, index) => {
          const isRemoving = loading && removingUrl === attachment.url;

          return (
            <div
              key={attachment.url}
              className="group relative size-36 shrink-0 cursor-zoom-in overflow-hidden rounded-lg border border-border bg-muted shadow-md"
              onClick={() => {
                setCurrentIndex(index);
                setOpen(true);
              }}
            >
              <img
                className="size-full object-cover"
                src={readImage(attachment.url)}
                alt={attachment.name}
              />
              <div
                className={cn(
                  'absolute inset-0 flex items-center justify-center bg-background/30 transition-opacity',
                  isRemoving
                    ? 'opacity-100'
                    : 'opacity-0 group-hover:opacity-100',
                )}
              >
                {isRemoving ? (
                  <Spinner />
                ) : (
                  <IconZoomIn size={28} className="text-primary-foreground" />
                )}
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={(e) => handleRemoveImage(e, attachment)}
                className="absolute -right-0.5 top-0.5 z-10 size-6 rounded-full bg-destructive text-background shadow-md hover:bg-destructive/80 hover:text-background"
                aria-label={t('remove-image', { name: attachment.name })}
              >
                <IconX size={12} />
              </Button>
            </div>
          );
        })}
      </div>

      {attachments.length > 1 && (
        <>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute -left-4 top-1/2 hidden size-8 -translate-y-1/2 rounded-full bg-background shadow hover:bg-background lg:inline-flex"
            onClick={() =>
              scrollContainerRef.current?.scrollBy({
                left: -160,
                behavior: 'smooth',
              })
            }
            aria-label={t('previous')}
          >
            <IconChevronLeft size={20} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute -right-4 top-1/2 hidden size-8 -translate-y-1/2 rounded-full bg-background shadow hover:bg-background lg:inline-flex"
            onClick={() =>
              scrollContainerRef.current?.scrollBy({
                left: 160,
                behavior: 'smooth',
              })
            }
            aria-label={t('next')}
          >
            <IconChevronRight size={20} />
          </Button>
        </>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <Dialog.Content className="max-w-fit border-0 bg-transparent shadow-none">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 z-50 size-8 rounded-full bg-background hover:bg-background"
            onClick={() => setOpen(false)}
            aria-label={t('close')}
          >
            <IconX size={20} />
          </Button>

          {attachments.length > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 z-50 size-8 -translate-y-1/2 rounded-full bg-background hover:bg-background"
              onClick={() =>
                setCurrentIndex(
                  currentIndex === 0
                    ? attachments.length - 1
                    : currentIndex - 1,
                )
              }
              aria-label={t('previous')}
            >
              <IconChevronLeft size={24} />
            </Button>
          )}

          {currentAttachment && (
            <img
              src={readImage(currentAttachment.url)}
              alt={currentAttachment.name}
              className="max-h-[90vh] max-w-[90vw] rounded object-contain shadow-lg"
            />
          )}

          {attachments.length > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 z-50 size-8 -translate-y-1/2 rounded-full bg-background hover:bg-background"
              onClick={() =>
                setCurrentIndex((currentIndex + 1) % attachments.length)
              }
              aria-label={t('next')}
            >
              <IconChevronRight size={24} />
            </Button>
          )}
        </Dialog.Content>
      </Dialog>
    </div>
  );
};
