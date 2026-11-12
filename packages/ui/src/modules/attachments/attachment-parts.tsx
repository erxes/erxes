import { IconChevronLeft, IconChevronRight, IconX } from '@tabler/icons-react';
import { Button } from 'erxes-ui/components/button';
import { Dialog } from 'erxes-ui/components/dialog';
import { Spinner } from 'erxes-ui/components/spinner';
import { cn } from 'erxes-ui/lib/utils';
import { useRef } from 'react';
import { useAttachmentContext } from './context';
import type { IAttachment } from './types';

const SCROLL_STEP = 150;

export const Heading = ({ children }: { children: React.ReactNode }) => (
  <h4 className="uppercase text-sm text-muted-foreground pb-4">{children}</h4>
);

/** A horizontal list with scroll buttons on wide screens. */
export const ScrollTrack = ({ children, label }: { children: React.ReactNode; label: string }) => {
  const ref = useRef<HTMLUListElement>(null);

  const scroll = (direction: 1 | -1) =>
    ref.current?.scrollBy({ left: direction * SCROLL_STEP, behavior: 'smooth' });

  return (
    <div className="relative">
      <div className="absolute top-1/2 -left-4 -translate-y-1/2 hidden lg:block z-10">
        <button
          type="button"
          className="bg-background p-1 rounded-full shadow"
          onClick={() => scroll(-1)}
          aria-label={`Scroll ${label} left`}
        >
          <IconChevronLeft size={20} />
        </button>
      </div>
      <ul ref={ref} className="overflow-x-auto flex gap-4 scroll-smooth" aria-label={label}>
        {children}
      </ul>
      <div className="absolute top-1/2 -right-4 -translate-y-1/2 hidden lg:block z-10">
        <button
          type="button"
          className="bg-background p-1 rounded-full shadow"
          onClick={() => scroll(1)}
          aria-label={`Scroll ${label} right`}
        >
          <IconChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export const useIsRemoving = (attachment: IAttachment) => {
  const { removingUrl, isLoading } = useAttachmentContext();

  return isLoading && removingUrl === attachment.url;
};

/** The small red button in the corner of an attachment, shown on hover. */
export const RemoveAttachmentButton = ({ attachment }: { attachment: IAttachment }) => {
  const { handleRemoveAttachment } = useAttachmentContext();

  return (
    <Button
      variant="ghost"
      disabled={useIsRemoving(attachment)}
      onClick={(event) => void handleRemoveAttachment(event, attachment)}
      className="absolute hidden group-hover:flex items-center justify-center top-1 right-1 bg-destructive/40 hover:bg-destructive/80 text-background rounded-full p-1 w-5 h-5 shadow-md z-10"
      aria-label={`Remove ${attachment.name}`}
    >
      <IconX size={10} aria-hidden />
    </Button>
  );
};

/** An image or video tile that opens the lightbox, with the remove button. */
export const MediaThumbnail = ({
  attachment,
  onOpen,
  icon,
  className,
  overlayClassName,
  children,
}: {
  attachment: IAttachment;
  onOpen: () => void;
  icon: React.ReactNode;
  className?: string;
  overlayClassName?: string;
  children: React.ReactNode;
}) => (
  <li
    className={cn(
      'group relative w-36 h-36 rounded-lg border border-border shadow-md shrink-0',
      className,
    )}
  >
    <button
      type="button"
      className="block w-full h-full"
      onClick={onOpen}
      aria-label={`Open ${attachment.name}`}
    >
      {children}
      <span
        className={cn(
          'absolute inset-0 flex items-center justify-center bg-background/30 rounded-lg',
          overlayClassName,
        )}
      >
        {useIsRemoving(attachment) ? <Spinner /> : icon}
      </span>
    </button>
    <RemoveAttachmentButton attachment={attachment} />
  </li>
);

const navButtonClassName =
  'absolute bg-background/80 hover:bg-background p-1.5 rounded-full z-50 transition-colors';

/** The dialog around one image or video, with close, previous, next and a counter. */
export const Lightbox = ({
  open,
  onOpenChange,
  title,
  kind,
  position,
  count,
  onPrev,
  onNext,
  actions,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  kind: 'image' | 'video';
  position: number;
  count: number;
  onPrev: () => void;
  onNext: () => void;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <Dialog.Content
      className="relative bg-transparent max-w-fit shadow-none border-0"
      aria-describedby={undefined}
    >
      <Dialog.Title className="sr-only">{title}</Dialog.Title>
      <Button
        variant="secondary"
        size="icon"
        className={cn(navButtonClassName, 'top-6 -right-4')}
        onClick={() => onOpenChange(false)}
        aria-label="Close lightbox"
      >
        <IconX size={20} />
      </Button>
      {actions}
      <Button
        variant="secondary"
        size="icon"
        className={cn(navButtonClassName, '-left-4 top-1/2 -translate-y-1/2')}
        onClick={onPrev}
        aria-label={`Previous ${kind}`}
      >
        <IconChevronLeft size={24} />
      </Button>
      {children}
      <Button
        variant="secondary"
        size="icon"
        className={cn(navButtonClassName, '-right-4 top-1/2 -translate-y-1/2')}
        onClick={onNext}
        aria-label={`Next ${kind}`}
      >
        <IconChevronRight size={24} />
      </Button>
      {count > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/70 text-foreground text-xs px-3 py-1 rounded-full">
          {position + 1} / {count}
        </div>
      )}
    </Dialog.Content>
  </Dialog>
);
